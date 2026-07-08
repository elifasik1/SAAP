namespace SAAP.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(string userId, string userName, IList<string> roles);
}
