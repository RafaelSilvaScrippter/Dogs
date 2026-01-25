export  const postTable = /*SQL */ `

    CREATE TABLE IF NOT EXISTS "users" (
        "user_id" INTEGER NOT NULL,
        "user_name" TEXT NOT NULL UNIQUE,
        "email" TEXT NOT NULL UNIQUE,
        "password_hash" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "posts"
    (   "id" INTEGER PRIMARY KEY,
        "name" TEXT NOT NULL,
        "views" INTEGER NOT NULL,
        "peso" INTEGER NOT NULL,
        "idade" INTEGER NOT NULL,
        FOREIGN KEY ("id") REFERENCES "users"("user_id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "comments"
    (   "id" INTEGER PRIMARY KEY,
        "comment" TEXT NOT NULL,
        "comment_user" INTEGER NOT NULL,
        FOREIGN KEY ("comment_user") REFERENCES "posts"("id") ON DELETE CASCADE
    );

`