module.exports = {
    root: true,
    extends: [
        'bitrefill',
        'bitrefill/node'
    ],
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json'
            },
            node: true
        }
    },
    rules: {
        'import/order': 'off',
        'n/no-deprecated-api': 'error',
        'import/no-cycle': 'error',
        'import/no-unresolved': ['error', { ignore: ['^@modelcontextprotocol/sdk/'] }]
    }
};
