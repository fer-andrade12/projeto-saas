export default function disableHostCheck() {
  return {
    name: 'disable-host-check',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Always allow the request regardless of Host header
        next()
      })
    }
  }
}
