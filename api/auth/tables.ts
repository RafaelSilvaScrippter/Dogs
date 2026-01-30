export const tableAuth = /*SQL */ `


    CREATE TABLE IF NOT EXISTS "users" (
        "user_id" INTEGER NOT NULL,
        "user_name" TEXT NOT NULL UNIQUE,
        "email" TEXT NOT NULL UNIQUE,
        "password_hash" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "session" (
        "id" INTEGER NOT NULL,
        "ip" TEXT NOT NULL,
        "ua" TEXT NOT NULL,
        "expires" TEXT NOT NULL,
        "session_hash" TEXT NOT NULL,
        "revoked"  INTEGER NOT NULL DEFAULT 0 CHECK("revoked" IN (0,1)),
        FOREIGN KEY ("id") REFERENCES "users"("user_id")
    );

    CREATE TABLE IF NOT EXISTS "resets" (
        "token_hash" TEXT NOT NULL,
        "user_id" INTEGER NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users"
    )

`