// src/auth/jwt.strategy.ts
import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Request } from "express";
import { passportJwtSecret } from "jwks-rsa";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          console.log(req.headers);
          const auth = req.headers.authorization;
          this.logger.debug(`Authorization header: ${auth}`);
          if (!auth) return null;
          const [type, token] = auth.split(" ");
          return type === "Bearer" ? token : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "http://localhost:3000/api/auth/jwks",
      }),
      algorithms: ["ES256"],
    });
  }

  async validate(payload: any) {
    this.logger.debug(`JWT payload validated: ${JSON.stringify(payload)}`);
    return { githubId: payload.sub, email: payload.email };
  }
}
