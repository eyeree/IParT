export const tokenId = getTokenId();

function getTokenId() {
    try {
        const tokenId = Number.parseInt(window.location.hash.substring(1));
        if (isNaN(tokenId)) {
            throw new Error(`could not parse "${window.location.hash.substring(1)}" as an integer`);
        }
        return tokenId;
    } catch (e) {
        throw new Error(`url fragment must be the token id ➜ ${e}`);
    }
}
