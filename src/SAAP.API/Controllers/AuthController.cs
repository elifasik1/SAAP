using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authorization;
using SAAP.Application.Common.Interfaces;
using SAAP.Domain.Entities;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace SAAP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableCors("AllowFrontend")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly ITokenService _tokenService;

    public AuthController(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { Message = "User with this email already exists." });

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        // Ensure "User" role exists and assign it
        var roleExists = await _roleManager.RoleExistsAsync("User");
        if (!roleExists)
        {
            await _roleManager.CreateAsync(new Role { Name = "User" });
        }
        await _userManager.AddToRoleAsync(user, "User");

        return Ok(new { Message = "Registration successful." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized(new { Message = "Invalid credentials." });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateToken(user);

        return Ok(new { Token = token, Expiration = DateTime.UtcNow.AddHours(2) });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { Message = "Geçersiz oturum." });

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return NotFound(new { Message = "Kullanıcı bulunamadı." });

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? string.Empty,
            roles.FirstOrDefault() ?? "User",
            user.AvatarUrl
        ));
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { Message = "Geçersiz oturum." });

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return NotFound(new { Message = "Kullanıcı bulunamadı." });

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            var existing = await _userManager.FindByEmailAsync(request.Email);
            if (existing != null && existing.Id != user.Id)
                return BadRequest(new { Message = "Bu e-posta adresi zaten kullanılıyor." });

            user.Email = request.Email;
            user.UserName = request.Email;
        }

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserProfileResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? string.Empty,
            roles.FirstOrDefault() ?? "User",
            user.AvatarUrl
        ));
    }

    [Authorize]
    [HttpPut("avatar")]
    [RequestSizeLimit(1_000_000)]
    public async Task<IActionResult> UpdateAvatar(IFormFile file)
    {
        if (file is null || file.Length == 0 || file.Length > 1_000_000)
            return BadRequest(new { Message = "Profil görseli en fazla 1 MB olabilir." });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
            return BadRequest(new { Message = "Yalnızca JPG, PNG veya WEBP görseller kabul edilir." });

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId)) return Unauthorized();
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return NotFound();

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{user.Id:N}-{Guid.NewGuid():N}{extension}";
        var avatarsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");
        Directory.CreateDirectory(avatarsDirectory);
        await using (var stream = System.IO.File.Create(Path.Combine(avatarsDirectory, fileName)))
            await file.CopyToAsync(stream);

        user.AvatarUrl = $"/avatars/{fileName}";
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);
        return Ok(new { avatarUrl = user.AvatarUrl });
    }
}

public record RegisterRequest(
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password,
    [Required] string FirstName,
    [Required] string LastName
);

public record LoginRequest(
    [Required][EmailAddress] string Email,
    [Required] string Password
);

public record UserProfileResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    string? AvatarUrl
);

public record UpdateProfileRequest(
    [Required] string FirstName,
    [Required] string LastName,
    [Required][EmailAddress] string Email
);
