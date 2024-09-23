// Generates a random photo
const randomNumber = Math.floor(Math.random() * 1000);

randomPhoto = async () => {
  try {
    const randomPhotoResponse = await fetch(
      `https://picsum.photos/${randomNumber}`
    );
    return randomPhotoResponse;
  } catch (e) {
    console.error(e);
  }
};

randomPhoto()
  .then((res) => {
    console.log(res);
    console.log(res.url);
  })
  .catch((e) => {
    console.error(e);
  });
