const axios = require('axios');

const USER = 'ozerdemir1998';
const REPO = 'RamadanApp';

async function checkRepo() {
    try {
        console.log(`Checking repository: https://api.github.com/repos/${USER}/${REPO}`);

        // 1. Get Default Branch
        const repoInfo = await axios.get(`https://api.github.com/repos/${USER}/${REPO}`);
        const defaultBranch = repoInfo.data.default_branch;
        console.log(`✅ Default Branch: ${defaultBranch}`);

        // 2. List assets/recipe_images
        const contentUrl = `https://api.github.com/repos/${USER}/${REPO}/contents/assets/recipe_images?ref=${defaultBranch}`;
        console.log(`\nListing contents of ${contentUrl}...`);

        const content = await axios.get(contentUrl);

        console.log(`\n--- Files in Repo (${content.data.length}) ---`);
        content.data.forEach(item => {
            console.log(item.name);
        });
        console.log("-------------------------------------");

    } catch (error) {
        if (error.response) {
            console.error(`❌ Error: ${error.response.status} ${error.response.statusText}`);
            if (error.response.status === 404) {
                console.error("   The repository might be PRIVATE or does not exist.");
                console.error("   Please ensure 'Settings -> Danger Zone -> Change visibility' is Public.");
            }
        } else {
            console.error("Error:", error.message);
        }
    }
}

checkRepo();
