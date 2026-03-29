using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;

namespace UdemyClone.Api.Services;

public class CloudflareStreamService
{
    private readonly HttpClient _http;
    private readonly CloudflareStreamOptions _options;

    public CloudflareStreamService(HttpClient http, IOptions<CloudflareStreamOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public async Task<DirectUploadSession> CreateDirectUploadAsync(int? maxDurationSeconds)
    {
        if (string.IsNullOrWhiteSpace(_options.AccountId) || string.IsNullOrWhiteSpace(_options.ApiToken))
        {
            throw new InvalidOperationException("Cloudflare Stream is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_options.CustomerCode))
        {
            throw new InvalidOperationException("Cloudflare Stream customer code is missing.");
        }

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"https://api.cloudflare.com/client/v4/accounts/{_options.AccountId}/stream/direct_upload");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiToken);
        request.Content = JsonContent.Create(new
        {
            maxDurationSeconds = maxDurationSeconds ?? _options.MaxDurationSeconds
        });

        using var response = await _http.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Cloudflare Stream error: {response.StatusCode}. {errorBody}");
        }

        var payload = await response.Content.ReadFromJsonAsync<CloudflareDirectUploadResponse>();
        var uploadUrl = payload?.Result?.UploadUrl;
        var uid = payload?.Result?.Uid;

        if (string.IsNullOrWhiteSpace(uploadUrl) || string.IsNullOrWhiteSpace(uid))
        {
            throw new InvalidOperationException("Cloudflare Stream did not return a valid upload URL.");
        }

        var playerUrl = $"https://customer-{_options.CustomerCode}.cloudflarestream.com/{uid}/iframe";

        return new DirectUploadSession
        {
            UploadUrl = uploadUrl,
            VideoUid = uid,
            PlayerUrl = playerUrl
        };
    }

    public class DirectUploadSession
    {
        public required string UploadUrl { get; init; }
        public required string VideoUid { get; init; }
        public required string PlayerUrl { get; init; }
    }

    private sealed class CloudflareDirectUploadResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("result")]
        public CloudflareDirectUploadResult? Result { get; set; }
    }

    private sealed class CloudflareDirectUploadResult
    {
        [JsonPropertyName("uploadURL")]
        public string? UploadUrl { get; set; }

        [JsonPropertyName("uid")]
        public string? Uid { get; set; }
    }
}
