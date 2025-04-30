import { Application, Context } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use(async (ctx: Context) => {
  try {
    await ctx.send({ root: "./dist", index: "index.html" });
  } catch {
    ctx.response.status = 404;
    ctx.response.body = "404 File not found";
  }
});

await app.listen({ port: 8000 });