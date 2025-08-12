export class CustomTokenizer {
    constructor() {
        this.vocab = new Map();
        this.reverseVocab = new Map();
        this.specialTokens = {
            PAD: "[PAD]",
            UNK: "[UNK]",
            BOS: "[BOS]",
            EOS: "[EOS]",
        };
        this.vocabSize = 0;
        this.isTraned = false;
    }

    /**
     * Train the tokenizer on a corpus of text
     * @param {string} text - Training text corpus
     * @param {number} minFreq - Minimum frequency for a token to be included
     */
    train(text, minFreq = 1) {
        console.log("Training tokenizer...");
        this.vocab.clear();
        this.reverseVocab.clear();

        // Add special tokens first
        let tokenId = 0;
        for (const [key, token] of Object.entries(this.specialTokens)) {
            this.vocab.set(token, tokenId);
            this.reverseVocab.set(tokenId, token);
            tokenId++;
        }

        // Tokenize text (simple whitespace + punctuation splitting)
        const tokens = this._tokenize(text);

        // Count token frequencies
        const tokenCounts = new Map();
        for (const token of tokens) {
            tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
        }

        // Add tokens that meet minimum frequency requirement
        for (const [token, count] of tokenCounts.entries()) {
            if (count >= minFreq && !this.vocab.has(token)) {
                this.vocab.set(token, tokenId);
                this.reverseVocab.set(tokenId, token);
                tokenId++;
            }
        }

        this.vocabSize = this.vocab.size;
        this.isTraned = true;

        console.log(`Training complete! Vocabulary size: ${this.vocabSize}`);
        return this;
    }

    /**
     * Simple tokenization: split on whitespace and separate punctuation
     * @param {string} text
     * @returns {string[]}
     */
    _tokenize(text) {
        return text
            .toLowerCase()
            .replace(/([.!?;,:])/g, " $1 ")
            .split(/\s+/)
            .filter((token) => token.length > 0);
    }

    /**
     * Encode text to token IDs
     * @param {string} text - Text to encode
     * @param {boolean} addSpecial - Add BOS/EOS tokens
     * @returns {number[]}
     */
    encode(text, addSpecial = false) {
        if (!this.isTraned) {
            throw new Error("Tokenizer must be trained before encoding");
        }

        const tokens = this._tokenize(text);
        let tokenIds = tokens.map(
            (token) =>
                this.vocab.get(token) ?? this.vocab.get(this.specialTokens.UNK) // Use UNK token for unknown words
        );

        if (addSpecial) {
            tokenIds = [
                this.vocab.get(this.specialTokens.BOS),
                ...tokenIds,
                this.vocab.get(this.specialTokens.EOS),
            ];
        }

        return tokenIds;
    }

    /**
     * Decode token IDs back to text
     * @param {number[]} tokenIds - Token IDs to decode
     * @param {boolean} skipSpecial - Skip special tokens in output
     * @returns {string}
     */
    decode(tokenIds, skipSpecial = true) {
        if (!this.isTraned) {
            throw new Error("Tokenizer must be trained before decoding");
        }

        const tokens = tokenIds
            .map((id) => this.reverseVocab.get(id) || this.specialTokens.UNK) // Use UNK token for unknown IDs
            .filter(
                (token) =>
                    !skipSpecial ||
                    !Object.values(this.specialTokens).includes(token)
            );

        return tokens.join(" ");
    }

    /**
     * Get vocabulary statistics
     * @returns {object}
     */
    getStats() {
        return {
            vocabSize: this.vocabSize,
            specialTokens: Object.keys(this.specialTokens).length,
            isTraned: this.isTraned,
            sampleTokens: Array.from(this.vocab.entries()).slice(0, 10),
        };
    }

    /**
     * Export tokenizer state
     * @returns {object}
     */
    export() {
        return {
            vocab: Object.fromEntries(this.vocab),
            reverseVocab: Object.fromEntries(this.reverseVocab),
            specialTokens: this.specialTokens,
            vocabSize: this.vocabSize,
            isTraned: this.isTraned,
        };
    }

    /**
     * Import tokenizer state
     * @param {object} data
     */
    import(data) {
        this.vocab = new Map(
            Object.entries(data.vocab).map(([k, v]) => [k, Number(v)])
        );
        this.reverseVocab = new Map(
            Object.entries(data.reverseVocab).map(([k, v]) => [Number(k), v])
        );
        this.specialTokens = data.specialTokens;
        this.vocabSize = data.vocabSize;
        this.isTraned = data.isTraned;
        return this;
    }
}
