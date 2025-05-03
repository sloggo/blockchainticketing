export const formatAddress = (address) => {
    if (!address) return '';
    // Remove 0x prefix if present
    const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
    // Add 0x prefix
    return '0x' + cleanAddress.toLowerCase();
};

export const formatPrivateKey = (privateKey) => {
    if (!privateKey) return '';
    // Remove 0x prefix if present
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    // Add 0x prefix
    return '0x' + cleanKey;
};

export const cleanAddress = (address) => {
    if (!address) return '';
    // Remove 0x prefix if present and convert to lowercase
    return address.startsWith('0x') ? address.slice(2).toLowerCase() : address.toLowerCase();
}; 