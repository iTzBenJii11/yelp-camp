// Generates a random photo
const randomNumber = Math.floor(Math.random() * 1000);

module.exports.randomPhoto = async () => {
  try {
    let response = await fetch(`https://picsum.photos/${randomNumber}`);
    return response;
  } catch (e) {
    console.error(e);
  }
};

