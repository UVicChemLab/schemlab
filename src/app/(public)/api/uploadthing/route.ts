import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "~/server/uploadthing/core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
