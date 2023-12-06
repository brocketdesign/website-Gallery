const { spawn } = require('child_process');

function startApp() {
  const app = spawn('node', ['server.js']); // Replace 'app.js' with your main app file

  app.on('error', (err) => {
    console.error('Failed to start app:', err);
  });

  app.on('exit', (code) => {
    if (code !== 0) { // If app crashes
      console.log('App crashed, restarting in 10 seconds...');
      setTimeout(startApp, 10000); // Restart after 10 seconds
    }
  });
}

startApp();
