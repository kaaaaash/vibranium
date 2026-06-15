import os
import time

import jwt
from fastapi import APIRouter, Depends, Header, HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pydantic import BaseModel


GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
VIB_JWT_SECRET = os.environ.get("VIB_JWT_SECRET", "")
VIB_JWT_ALGO = "HS256"
VIB_JWT_TTL = 60 * 60 * 8  # 8 hours


# comma-separated domains
# example:
# ALLOWED_DOMAINS=gmail.com,company.com
#ALLOWED_DOMAINS = [
   # d.strip().lower()
    #for d in os.environ.get(
        #"ALLOWED_DOMAINS",
        #"gmail.com",
        #"gmail.com",
    #).split(",")
    #if d.strip()
#]

ALLOWED_DOMAINS = ["gmail.com"]


# Replace with Postgres later
USERS = {
    "aaroh@gmail.com": {
        "role": "platform-admin",
        "team": "platform",
    },
    "sre@gmail.com": {
        "role": "sre",
        "team": "payments",
    },
    "dev@gmail.com": {
        "role": "developer",
        "team": "payments",
    },
    "aaroh.seth01@gmail.com": {
        "role": "platform-admin", 
        "team": "platform"
    },
}

    # local testing
    # "aaroh.seth01@gmail.com": {
    #     "role": "platform-admin",
    #     "team": "platform",
    # },



DEFAULT_ROLE = "developer"
DEFAULT_TEAM = "payments"


ROLE_PERMISSIONS = {
     "viewer": [
        "view"
    ],
    "developer": [
        "view",
        "deploy",
    ],
    "sre": [
        "view",
        "deploy",
        "rollback",
        "monitor",
    ],
    "platform-admin": [
        "view",
        "deploy",
        "rollback",
        "monitor",
        "manage_users",
    ],
}


TEAM_NAMESPACE = {
    "payments": "team-payments",
    "auth": "team-auth",
    "gateway": "team-gateway",
    "infra": "team-infra",
    "platform": "team-infra",
}


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


class LoginRequest(BaseModel):
    token: str


def _domain_of(email: str) -> str:
    return email.split("@")[-1].lower() if "@" in email else ""


def _verify_google_token(token: str):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID not configured",
        )

    try:
        return id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {e}",
        )


def _build_profile(
    email: str,
    name: str | None,
    picture: str | None,
):
    record = USERS.get(
        email,
        {
            "role": DEFAULT_ROLE,
            "team": DEFAULT_TEAM,
        },
    )

    role = record["role"]
    team = record["team"]

    return {
        "email": email,
        "name": name or email,
        "picture": picture or "",
        "role": role,
        "team": team,
        "namespace": TEAM_NAMESPACE.get(
            team,
            "team-payments",
        ),
        "permissions": ROLE_PERMISSIONS.get(
            role,
            [],
        ),
        "is_admin": role == "platform-admin",
    }


def _issue_vib_jwt(profile: dict):
    if not VIB_JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="VIB_JWT_SECRET not configured",
        )

    now = int(time.time())

    payload = {
        **profile,
        "iat": now,
        "exp": now + VIB_JWT_TTL,
        "iss": "vibranium",
    }

    return jwt.encode(
        payload,
        VIB_JWT_SECRET,
        algorithm=VIB_JWT_ALGO,
    )


@router.post("/login")
def login(body: LoginRequest):
    info = _verify_google_token(body.token)

    email = (
        info.get("email") or ""
    ).lower()

    if not info.get(
        "email_verified",
        False,
    ):
        raise HTTPException(
            status_code=403,
            detail="Email not verified",
        )

    if _domain_of(email) not in ALLOWED_DOMAINS:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied for {email}",
        )

    profile = _build_profile(
        email=email,
        name=info.get("name"),
        picture=info.get("picture"),
    )

    return {
        "access_token": _issue_vib_jwt(profile),
        "user": profile,
    }


def get_current_user(
    authorization: str = Header(default=None),
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Missing bearer token",
        )

    if not authorization.startswith(
        "Bearer "
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header",
        )

    token = authorization.split(
        " ",
        1,
    )[1]

    if not VIB_JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="VIB_JWT_SECRET not configured",
        )

    try:
        payload = jwt.decode(
            token,
            VIB_JWT_SECRET,
            algorithms=[VIB_JWT_ALGO],
            options={"require": ["exp"]},
        )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Session expired",
        )

    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid token: {e}",
        )


def require_permission(permission: str):
    def checker(
        user=Depends(
            get_current_user
        ),
    ):
        permissions = user.get(
            "permissions",
            [],
        )

        if permission not in permissions:
            raise HTTPException(
                status_code=403,
                detail=(
                    f"Role '{user.get('role', '?')}' "
                    f"lacks permission '{permission}'"
                ),
            )

        return user

    return checker


@router.get("/me")
def me(
    user=Depends(
        get_current_user
    ),
):
    return user