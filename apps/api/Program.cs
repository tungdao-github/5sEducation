using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using UdemyClone.Api.Data;
using UdemyClone.Api.Hubs;
using UdemyClone.Api.Models;
using UdemyClone.Api.Services;
using UdemyClone.Api.Filters;
using UdemyClone.Api.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using UdemyClone.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile("appsettings.Development.local.json", optional: true, reloadOnChange: true);
}

builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ApiProblemDetailsFilter>();
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var problemDetails = new ValidationProblemDetails(context.ModelState)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Validation failed.",
            Type = "https://httpstatuses.com/400"
        };

        problemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
        return new BadRequestObjectResult(problemDetails);
    };
});

builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = ctx =>
    {
        ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier;
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationDatabase(builder.Configuration);

builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("db");

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.SignIn.RequireConfirmedAccount = false;
        options.Lockout.AllowedForNewUsers = true;
        options.Lockout.MaxFailedAccessAttempts = 5;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
if (!builder.Environment.IsDevelopment())
{
    if (string.IsNullOrWhiteSpace(jwtOptions.Key)
        || jwtOptions.Key.Contains("CHANGE_THIS", StringComparison.OrdinalIgnoreCase)
        || jwtOptions.Key.Length < 32)
    {
        throw new InvalidOperationException("JWT signing key is missing or too weak. Set Jwt:Key to a strong secret.");
    }
}

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        var jwt = jwtOptions;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrWhiteSpace(accessToken)
                    && path.StartsWithSegments("/hubs/support"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", context =>
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            QueueLimit = 0
        });
    });
});

builder.Services.AddCors(options =>
{
    var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
        ?? ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174"];

    options.AddPolicy("web", policy =>
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IAdminStatsRepository, AdminStatsRepository>();
builder.Services.AddScoped<IAdminBlogPostsRepository, AdminBlogPostsRepository>();
builder.Services.AddScoped<IAdminAuditLogsRepository, AdminAuditLogsRepository>();
builder.Services.AddScoped<IAdminCategoriesRepository, AdminCategoriesRepository>();
builder.Services.AddScoped<IAdminReviewsRepository, AdminReviewsRepository>();
builder.Services.AddScoped<IAdminOrdersRepository, AdminOrdersRepository>();
builder.Services.AddScoped<IAdminCouponsRepository, AdminCouponsRepository>();
builder.Services.AddScoped<IAdminSettingsRepository, AdminSettingsRepository>();
builder.Services.AddScoped<IAdminSupportRepository, AdminSupportRepository>();
builder.Services.AddScoped<IAdminHomePageBlocksRepository, AdminHomePageBlocksRepository>();
builder.Services.AddScoped<IAdminLearningPathsRepository, AdminLearningPathsRepository>();
builder.Services.AddScoped<IAdminUsersRepository, AdminUsersRepository>();
builder.Services.AddScoped<ICourseCatalogRepository, CourseCatalogRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IInstructorCoursesRepository, InstructorCoursesRepository>();
builder.Services.AddScoped<IHistoryRepository, HistoryRepository>();
builder.Services.AddScoped<IBlogCommentsRepository, BlogCommentsRepository>();
builder.Services.AddScoped<ILearningPathsRepository, LearningPathsRepository>();
builder.Services.AddScoped<ILessonsRepository, LessonsRepository>();
builder.Services.AddScoped<IPublicContentRepository, PublicContentRepository>();
builder.Services.AddScoped<ISupportRepository, SupportRepository>();
builder.Services.AddScoped<IUserAddressesRepository, UserAddressesRepository>();
builder.Services.AddScoped<IUserEnrollmentsRepository, UserEnrollmentsRepository>();
builder.Services.AddScoped<IUserOrdersRepository, UserOrdersRepository>();
builder.Services.AddScoped<IUserProgressRepository, UserProgressRepository>();
builder.Services.AddScoped<IUserReviewsRepository, UserReviewsRepository>();
builder.Services.AddScoped<IUserWishlistRepository, UserWishlistRepository>();
builder.Services.AddScoped<AuthAccountService>();
builder.Services.AddScoped<AuthAccountFlowService>();
builder.Services.AddScoped<AuthProfileService>();
builder.Services.AddScoped<AuthPasswordRecoveryService>();
builder.Services.AddScoped<AuthEmailConfirmationService>();
builder.Services.AddScoped<GoogleAuthService>();
builder.Services.AddScoped<FacebookAuthService>();
builder.Services.AddScoped<AuthWorkflowService>();
builder.Services.AddScoped<AdminBlogPostsService>();
builder.Services.AddScoped<AdminAuditLogsService>();
builder.Services.AddScoped<AdminCategoriesService>();
builder.Services.AddScoped<AdminReviewsService>();
builder.Services.AddScoped<AdminOrdersService>();
builder.Services.AddScoped<AdminCouponsService>();
builder.Services.AddScoped<AdminSettingsService>();
builder.Services.AddScoped<AdminHomePageBlocksService>();
builder.Services.AddScoped<AdminLearningPathCrudService>();
builder.Services.AddScoped<AdminLearningPathsService>();
builder.Services.AddScoped<AdminLearningPathsStructureService>();
builder.Services.AddScoped<CouponValidationService>();
builder.Services.AddScoped<CourseCatalogService>();
builder.Services.AddScoped<CourseThumbnailStorageService>();
builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<CartCheckoutFlowService>();
builder.Services.AddScoped<CartCheckoutNotificationService>();
builder.Services.AddScoped<CartCheckoutService>();
builder.Services.AddScoped<BlogCommentsService>();
builder.Services.AddScoped<AdminStatsService>();
builder.Services.AddScoped<AdminSupportService>();
builder.Services.AddScoped<AdminUsersService>();
builder.Services.AddScoped<AdminUsersQueryService>();
builder.Services.AddScoped<AdminUsersMutationService>();
builder.Services.AddScoped<SupportMessageService>();
builder.Services.AddScoped<SupportReplyService>();
builder.Services.AddScoped<InstructorCoursesService>();
builder.Services.AddScoped<HistoryService>();
builder.Services.AddScoped<LearningPathsService>();
builder.Services.AddScoped<LessonReadService>();
builder.Services.AddScoped<LessonMutationService>();
builder.Services.AddScoped<LessonsService>();
builder.Services.AddScoped<LessonExerciseService>();
builder.Services.AddScoped<LessonExerciseStatusService>();
builder.Services.AddScoped<LessonExerciseSubmissionService>();
builder.Services.AddScoped<PublicContentService>();
builder.Services.AddScoped<SupportService>();
builder.Services.AddScoped<SupportNotificationService>();
builder.Services.AddScoped<UserAddressesService>();
builder.Services.AddScoped<UserEnrollmentsService>();
builder.Services.AddScoped<UserOrdersService>();
builder.Services.AddScoped<UserProgressService>();
builder.Services.AddScoped<UserReviewsService>();
builder.Services.AddScoped<UserWishlistService>();
builder.Services.AddScoped<UserAddressesQueryService>();
builder.Services.AddScoped<UserAddressesMutationService>();
builder.Services.AddScoped<UploadsService>();
builder.Services.AddScoped<VideoUploadSessionService>();
builder.Services.AddScoped<LocalVideoUploadService>();
builder.Services.AddScoped<AuthSocialService>();
builder.Services.AddScoped<AuthEmailService>();
builder.Services.Configure<CloudflareStreamOptions>(builder.Configuration.GetSection("CloudflareStream"));
builder.Services.Configure<GoogleAuthOptions>(builder.Configuration.GetSection("GoogleAuth"));
builder.Services.Configure<FacebookAuthOptions>(builder.Configuration.GetSection("FacebookAuth"));
builder.Services.Configure<FrontendOptions>(builder.Configuration.GetSection("Frontend"));
builder.Services.AddHttpClient<CloudflareStreamService>();
builder.Services.AddHttpClient("social-auth");
builder.Services.AddSingleton<IEmailSender, ConsoleEmailSender>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
if (builder.Configuration.GetValue<bool>("ForwardedHeaders:Enabled"))
{
    var forwardedOptions = new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
    };
    forwardedOptions.KnownNetworks.Clear();
    forwardedOptions.KnownProxies.Clear();
    app.UseForwardedHeaders(forwardedOptions);
}
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseStaticFiles();

app.UseCors("web");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<AdminAuditMiddleware>();
app.UseRateLimiter();

app.MapControllers();
app.MapHub<SupportHub>("/hubs/support").RequireCors("web");
app.MapHealthChecks("/health");
app.MapHealthChecks("/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Name == "db"
});

await SeedData.InitializeAsync(app.Services);

app.Run();

public partial class Program { }
