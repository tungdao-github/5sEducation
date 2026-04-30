using UdemyClone.Api.Dtos;
using UdemyClone.Api.Models;

namespace UdemyClone.Api.Services;

public static class UserAddressMutationHelper
{
    public static UserAddressDraft BuildDraft(string userId, UserAddressCreateRequest request)
    {
        return new UserAddressDraft(
            userId,
            Trim(request.Label),
            Trim(request.RecipientName),
            Trim(request.Phone),
            Trim(request.Line1),
            Trim(request.Line2),
            Trim(request.City),
            NormalizeOrDefault(request.State, string.Empty),
            NormalizeOrDefault(request.PostalCode, string.Empty),
            NormalizeOrDefault(request.Country, "Vietnam"),
            request.IsDefault);
    }

    public static UserAddressDraft BuildDraft(UserAddress address, UserAddressUpdateRequest request)
    {
        return new UserAddressDraft(
            address.UserId,
            Trim(request.Label),
            Trim(request.RecipientName),
            Trim(request.Phone),
            Trim(request.Line1),
            Trim(request.Line2),
            Trim(request.City),
            NormalizeOrDefault(request.State, string.Empty),
            NormalizeOrDefault(request.PostalCode, string.Empty),
            NormalizeOrDefault(request.Country, "Vietnam"),
            request.IsDefault);
    }

    public static void ApplyDraft(UserAddress address, UserAddressDraft draft)
    {
        address.Label = draft.Label;
        address.RecipientName = draft.RecipientName;
        address.Phone = draft.Phone;
        address.Line1 = draft.Line1;
        address.Line2 = draft.Line2;
        address.City = draft.City;
        address.State = draft.State;
        address.PostalCode = draft.PostalCode;
        address.Country = draft.Country;
        address.IsDefault = draft.IsDefault;
        address.UpdatedAt = DateTime.UtcNow;
    }

    public static UserAddressDto Map(UserAddress address)
    {
        return new UserAddressDto
        {
            Id = address.Id,
            Label = address.Label,
            RecipientName = address.RecipientName,
            Phone = address.Phone,
            Line1 = address.Line1,
            Line2 = address.Line2,
            City = address.City,
            State = address.State,
            PostalCode = address.PostalCode,
            Country = address.Country,
            IsDefault = address.IsDefault,
            CreatedAt = address.CreatedAt,
            UpdatedAt = address.UpdatedAt
        };
    }

    private static string Trim(string? value)
    {
        return (value ?? string.Empty).Trim();
    }

    private static string NormalizeOrDefault(string? value, string fallback)
    {
        var trimmed = (value ?? string.Empty).Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? fallback : trimmed;
    }
}

public readonly record struct UserAddressDraft(
    string UserId,
    string Label,
    string RecipientName,
    string Phone,
    string Line1,
    string? Line2,
    string City,
    string State,
    string PostalCode,
    string Country,
    bool IsDefault);
