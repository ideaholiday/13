module.exports = {
  apps: [
    {
      name: "ih-backend",
      script: "php",
      args: "artisan serve --host=127.0.0.1 --port=5000",
      cwd: "/Users/jitendramaury/iholiday/13/ih-backend",
      env: { "APP_ENV": "production" }
    }
  ]
}
