using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace UdemyClone.Api.Hubs;

[Authorize]
public class SupportHub : Hub
{
    public const string AdminGroup = "support-admins";

    public static string UserGroup(string userId) => $"support-user:{userId}";

    public override async Task OnConnectedAsync()
    {
        var user = Context.User;
        if (user?.Identity?.IsAuthenticated == true)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrWhiteSpace(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
            }

            if (user.IsInRole("Admin"))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, AdminGroup);
            }
        }

        await base.OnConnectedAsync();
    }
}
