import util from "util";
import OAuth2Strategy, { InternalOAuthError } from "passport-oauth2";

export function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL =
    options.authorizationURL ||
    "https://auth.login.yahoo.co.jp/yconnect/v2/authorization";
  options.tokenURL =
    options.tokenURL || "https://auth.login.yahoo.co.jp/yconnect/v2/token";

  OAuth2Strategy.call(this, options, verify);
  this.name = "yahoo-jp";
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(
    "https://userinfo.yahooapis.jp/yconnect/v1/attribute?schema=openid",
    accessToken,
    function(err, body) {
      if (err) {
        return done(
          new InternalOAuthError("failed to fetch user profile", err)
        );
      }

      try {
        const json = JSON.parse(body);

        const profile = {
          provider: "yahoo-jp",
          id: json.user_id,
          name: json.name,
          email: json.email,
          birthday: json.birthday
        };

        done(null, profile);
      } catch (e) {
        done(e);
      }
    }
  );
};
