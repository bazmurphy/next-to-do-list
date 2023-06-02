# NextJS 13 To Do List

create a next app
`npx create-next-app@latest .`

---

## Prisma

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

in `/src/` create a new file `db.ts`

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

---

## Initial setup

remove everything except tailwind imports from `/src/app/globals.css`

adjust metadata in `/src/app/layout.tsx`

remove everything inside Home in `/src/app/page.tsx`

add some initial classes to `<body>` in `/src/app/layout.tsx`

---

## Adding `/new/` route

add `/new/` folder in `/src/app/`

create `/src/app/page.tsx`

```
export default function Page() {
  return <h1>New</h1>
}
```

and test the route http://localhost:3000/new

---

## Getting the To Do data

Normally you would use a fetch or a useQuery to get your "todos" data
with Server Components inside of NextJS13 we don't need to do any of that
as long as we are using the `/app/` folder we have the ability to call Server Code inside of our Components
and it will run all of this on the Server and send down the data to the Client

so we can make a call to prisma (remembering to make the parent function `async`) on the model `todo` using the `findMany` method

```
const todos = await prisma.todo.findMany();
```

and further down we can map over them

```
{todos.map((todo) => {
  return <li key={todo.id}>{todo.title}</li>;
})}
```

And in the console it shows we made a query to our database:

```
prisma:query SELECT `main`.`Todo`.`id`, `main`.`Todo`.`title`, `main`.`Todo`.`complete`, `main`.`Todo`.`createdAt`, `main`.`Todo`.`updatedAt` FROM `main`.`Todo` WHERE 1=1 LIMIT ? OFFSET ?
```

this is the great thing about Server Components
as long as your code doesn't do anything on the Client such as `useState`, `useEffect` or `onChange` event listeners
it will run ALL of your code on the Server and then send that down to the client
which means you can do things like call your database using prisma FROM your Component
and none of that Server/Database code is going to get the client
but the actual data like the todos is going to make it's way down to the client

If we add a todo with temporary code

```
await prisma.todo.create({
  data: { title: "test to do 1", complete: false },
});
```

When we inspect the console of the rendered page we can see the todo information is already in the HTML

the Server generated all the HTML and sent it down to the Client
the Client didn't have to do anything at all
the Client just recieved raw HTML and that's all it has to deal with
We don't have to worry about Loading states, Errror states for our fetch/Query etc.
