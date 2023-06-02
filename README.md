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

---

## ToDoItem component

create a `/src/components/` folder

create a `ToDoItem.tsx`

```
// type the ToDoItem props
type ToDoItemProps = {
  id: string;
  title: string;
  complete: boolean;
};

// create a ToDoItem component
export function ToDoItem({ id, title, complete }: ToDoItemProps) {
  return (
      <li>
        <input id={id} type="checkbox" />
        <label htmlFor={id}>{title}</label>
      </li>
  );
}
```

import the `ToDoItem` component in `/app/page.tsx` Home and use it in the todos.map return

```
{todos.map((todo) => {
  return <ToDoItem key={todo.id} {...todo} />;
})}
```

---

## Add To Do Form

we create a form in `/src/app/new/page.tsx`

```
<form>
  {/* the name="title" is really important because we are going to use that inside of our Server Action */}
  <input type="text" name="title" />
  <div>
    <Link href="..">Cancel</Link>
    <button type="submit">Create</button>
  </div>
</form>
```

---

## Server Actions

(!) we must specifically enable `experimental` `serverActions` in the `next.config.js`

```
const nextConfig = {
  experimental: {
    serverActions: true,
  },
};
```

the great thing about Server Actions inside NextJS13 is they are built on top of the normal browser primitives
this is really good because if the JavaScript on the page is disabled everything will still work (without the bells & whistles)
and its built on things we are already used to for example with Forms

we can write a function, it must be async (that is really important)
and to run this function on the server you need to add "use server" as a string at the top of the function
it is saying "this function is server code and it will never run on the client, it only ever runs on the server"

```
  async function createToDo(data: FormData) {
    "use server";

    console.log("Testing Server Actions createToDo");
  }
```

And we then add that to the `action` of the `<form>`

```
<form action={createToDo}>
```

and when we submit the form, it will call the createToDo function on our Server
and in the Server console we see
and in the Client console nothing happens

```
Testing Server Actions createToDo
```

If we check the Client console nothing happens
But if we check the Network tab we can see when we submit the form it makes a `fetch` request (`POST`) to `http://localhost:3000/new`

Now we can write the createToDo function (Server Actions) to handle the form submit:

1. we use the form data get method to get the value of the input with the name "title"
2. we do input validation & error handling
3. we create a new todo in the database with prisma
4. and then redirect (using the NextJS function) back to the home page

```
  async function createToDo(data: FormData) {
    console.log("Testing Server Actions createToDo");

    const title = data.get("title")?.valueOf();

    if (typeof title !== "string" || title.length === 0) {
      throw new Error("Invalid title");
    }

    await prisma.todo.create({ data: { title: title, complete: false } });

    redirect("/");
  }
```

Now when we create a new to do, it runs our Server Action, and we can see the Prisma console output:

```
prisma:query SELECT 1
prisma:query BEGIN
prisma:query INSERT INTO `main`.`Todo` (`id`, `title`, `complete`, `createdAt`, `updatedAt`) VALUES (?,?,?,?,?) RETURNING `id` AS `id`
prisma:query SELECT `main`.`Todo`.`id`, `main`.`Todo`.`title`, `main`.`Todo`.`complete`, `main`.`Todo`.`createdAt`, `main`.`Todo`.`updatedAt` FROM `main`.`Todo` WHERE `main`.`Todo`.`id` = ? LIMIT ? OFFSET ?
prisma:query COMMIT
```

All the code for this asynchronous functions is being run on the Server, and so our Client is much simpler
At the moment there is no logic on the Client, everything is rendered and sent down from the Server
It makes it a lot easier to write clean Client code, because you don't have to worry about Loading states etc.

---

# Toggle To Do

We add `defaultChecked` and `onChange` to our `ToDoItem` component
the `defaultChecked` is our `todo.complete` `boolean`
and the `onChange` runs the `toggleToDo` function which takes in an `id` and if the `event.target` is `checked` (checkbox)

```
defaultChecked={complete}
onChange={(event) => toggleToDo(id, event.target.checked)}
```

We need to update the props of the `ToDoItem` component with the `toggleToDo` function

```
export function ToDoItem({ id, title, complete, toggleToDo }: ToDoItemProps) {
```

And include it in our map on the Home Page

```
{todos.map((todo) => {
  return <ToDoItem key={todo.id} {...todo} toggleToDo={toggleToDo} />;
})}
```

Now we have an `onChange` hooked up, we need to convert the `ToDoItem` component to a **Client Component** (because the default is a **Server Component**)

We need to add `"use client"` at the top of the file.

This is a Client Side Rendered component so don't render any of this on the Server, all of this interaction stuff is going to happen on the Client.

Now in `/src/app/page.tsx` we can create the `toggleToDo` function

we create an `async` function, that takes in an `id` and a `complete`

1. we tell it is is a Server Action with `"use server"`

2. we make a console log to demonstrate the function running on the Server

3. we use prisma to update the todo with that specific `id` and update the `complete` value

4. (!) Note: you cannot do redirects inside of your Server Action

```
async function toggleToDo(id: string, complete: boolean) {
  "use server";

  console.log(`Server Action toggleToDo id: ${id} complete: ${complete}`);

  // update the todo "complete" value, where the id is the same as the one passed to the function
  await prisma.todo.update({ where: { id }, data: { complete } });

  // (!) you cannot do redirects like this inside of your Server Action:
  // redirect("/");
}
```

---

# Deploy on Vercel

It seems NextJS uses `.env.local` for private/secret environment variables and `.env` is used for public environment variables

But Prisma reads environment variables from the `.env` file

[ What is the workaround(?) It seems there is a way using `dot-cli` ]

Create a vercel postgresql database

to the `schema.prisma` adjust the `datasource`:

```
datasource db {
  provider = "postgresql"
  url = env("POSTGRES_PRISMA_URL") // uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
  shadowDatabaseUrl = env("POSTGRES_URL_NON_POOLING") // used for migrations
}
```

Add to the `.env` (really it should be `.env.local` but see above) the various information:

```
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NON_POOLING=""
```

And also add these^ environemnt variables to the Vercel project deployment
