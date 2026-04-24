using UdemyClone.Api.Repositories;

namespace UdemyClone.Api.Services;

public class CartCheckoutNotificationService
{
    private readonly ICartRepository _repository;
    private readonly IEmailSender _emailSender;

    public CartCheckoutNotificationService(ICartRepository repository, IEmailSender emailSender)
    {
        _repository = repository;
        _emailSender = emailSender;
    }

    public async Task SendOrderConfirmationAsync(
        string userId,
        int orderId,
        decimal total,
        string currency,
        IEnumerable<string> courseTitles,
        DateTime now,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _repository.FindUserAsync(userId, cancellationToken);
            if (user != null && !string.IsNullOrWhiteSpace(user.Email))
            {
                var courseLines = courseTitles
                    .Where(title => !string.IsNullOrWhiteSpace(title))
                    .Select(title => $"- {title}")
                    .ToList();

                var body = $"Thanks for your order (#{orderId}). Your courses are now available.\n\n"
                           + (courseLines.Count > 0 ? $"Courses:\n{string.Join("\n", courseLines)}\n\n" : "")
                           + $"Order total: {total:0.00} {currency}\n"
                           + $"Order date: {now:yyyy-MM-dd HH:mm} UTC\n"
                           + "You can access them from My Learning.";

                await _emailSender.SendAsync(user.Email, "Enrollment confirmed", body);
            }
        }
        catch
        {
            // ignore email errors to avoid blocking checkout
        }
    }
}
