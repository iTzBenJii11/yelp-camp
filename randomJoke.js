// Random joke API
module.exports.randomJoke = async () => {
  try {
    let res = await fetch(`https://jsonplaceholder.typicode.com/todos/1`, {
      // Removed the dad joke and replaced with fake API whilst developing at work.
      // https://icanhazdadjoke.com

      // Tells API we expect a JSON response
      headers: {
        Accept: "application/json",
      },
    });
    // Return JSON response
    return res.json();
  } catch (e) {
    console.error(e);
  }
};

// Remove API at work due to security policy in place
