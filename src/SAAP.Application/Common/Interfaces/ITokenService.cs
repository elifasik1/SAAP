using SAAP.Domain.Entities;

namespace SAAP.Application.Common.Interfaces;

public interface ITokenService
{
    string CreateToken(User user);
}
