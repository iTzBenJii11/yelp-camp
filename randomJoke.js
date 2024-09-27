// Random joke API
module.exports.randomJoke = async () => {
  try {
    let res = await fetch(`https://icanhazdadjoke.com/`, {
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
