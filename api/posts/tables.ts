export  const postTable = /*SQL */ `


    CREATE TABLE IF NOT EXISTS "posts"
    (   "id" INTEGER PRIMARY KEY,
        "name" TEXT NOT NULL,
        "src" TEXT NOT NULL,
        "user_id" INTEGER NOT NULL,
        "views" INTEGER NOT NULL,
        "peso" INTEGER NOT NULL,
        "idade" INTEGER NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "comments"
    (   "id" INTEGER PRIMARY KEY,
        "comment" TEXT NOT NULL,
        "comment_user" INTEGER NOT NULL,
        FOREIGN KEY ("comment_user") REFERENCES "posts"("id") ON DELETE CASCADE
    );

`