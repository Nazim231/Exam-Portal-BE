import JWT from "jsonwebtoken";

const { sign, verify } = JWT;
const secretKey =
  "*c<o6#[/&(9wK=eCk<3a_sGpjWvBbg3<I6;=#RZ8)9a}cE6IC9crgJd&QZB4[!";

/**
 * Module used to validate the user
 */
class Auth {
  /**
   * Generate a signed token for user
   * @param {JSON} user
   * @returns {String}
   */
  generateAccessToken(user) {
    const userData = {
      _id: user._id,
      email: user.email,
      password: user.password,
    };

    return sign(userData, secretKey);
  }

  /**
   * Validate user token
   * @param {String} userAccessToken
   * @returns {JSON} user information retrieved from token
   */
  validateToken(token) {
    let user;

    try {
      user = verify(token, secretKey);
    } catch (ex) {
      console.log("AUTH_TOKEN_ERROR ::", ex);
    }

    return user;
  }
}

export const auth = new Auth();
