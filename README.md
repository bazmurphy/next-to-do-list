NextJS 13 To Do List

create a next app
`npx create-next-app@latest .`

install prisma as a dev dependency
`npx install prisma --save-dev`

initialise prisma
`npx prisma init --datasource-provider sqlite`

add `.env` to `.gitignore`

add a Prisma Schema:

```
model Todo {
  id        String   @id @default(uuid())
  title     String
  complete  Boolean
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

do a migration in our dev environment and give it a name "init" since we are initialising
`npx prisma migrate dev --name init`

it creates a `migration` folder/files and some `dev.db` files

add `dev.db` to `.gitignore`

in `src` create a new file `db.ts`

There is an issue with NextJS in dev mode where it creates multiple Prisma Client connections:
https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

the reason this is in a separate file in development mode
is because NextJs likes to do something called "Hot Reloading"
which will only sends down files that need to be changed
and it re-runs things without needing to restart the server
but it has a bit of a problem with Prisma because it tries to constantly create new connections to your Prisma Client

```
import { PrismaClient } from "@prisma/client";

// getting the global object and adding our Prisma Client to it
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// create a variable,
// and either set it to that global variable we created above,
// or creata a brand new Prisma Client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

// if we are NOT in production then get Prisma from that global variable
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

this instantiates a "Singleton"
no matter how many times we try to access this "prisma" variable
it will only ever create one single client
which will prevent the issue with Hot Reloading where many clients are spun up
