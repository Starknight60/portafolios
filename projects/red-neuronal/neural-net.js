class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;

        this.weightsIH = Array(this.hiddenSize).fill().map(() =>
            Array(this.inputSize).fill().map(() => Math.random() * 2 - 1)
        );

        this.weightsHO = Array(this.outputSize).fill().map(() =>
            Array(this.hiddenSize).fill().map(() => Math.random() * 2 - 1)
        );
        this.biasH = Array(this.hiddenSize).fill().map(() => Math.random() * 2 - 1);
        this.biasO = Array(this.outputSize).fill().map(() => Math.random() * 2 - 1);

        this.learningRate = 0.1;
    }
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    sigmoidDerivative(y) {
        return y * (1 - y);
    }
    forward(inputArray) {
        this.lastInputs = inputArray;
        this.lastHidden = Array(this.hiddenSize).fill().map((_, h) => {
            let sum = 0;
            for (let i = 0; i < this.inputSize; i++) {
                sum += inputArray[i] * this.weightsIH[h][i];
            }
            sum += this.biasH[h];
            return this.sigmoid(sum);
        });
        this.lastOutputs = Array(this.outputSize).fill().map((_, o) => {
            let sum = 0;
            for (let h = 0; h < this.hiddenSize; h++) {
                sum += this.lastHidden[h] * this.weightsHO[o][h];
            }
            sum += this.biasO[o];
            return this.sigmoid(sum);
        });
        return this.lastOutputs;
    }
    train(inputArray, targetArray) {
        const outputs = this.forward(inputArray);
        const outputError = Array(this.outputSize).fill().map((_, o) =>
            targetArray[o] - outputs[o]
        );
        const outputGradients = Array(this.outputSize).fill().map((_, o) =>
            outputErrors[o] * this.sigmoidDerivative(outputs[o]) * this.learningRate
        );
        for (let o = 0; o < this.outputSize; o++) {
            for (let h = 0; h < this.hiddenSize; h++) {
                const deltaWeight = outputGradient[o] * this.lastHidden[h];
                this.weightsHO[o][h] += deltaWeight;
            }
            this.biasO[o] += outputGradients[o];
        }
        const hiddenErrors = Array(this.hiddenSize).fill().map((_, h) => hiddenErrors[h] * this.sigmoidDerivative(this.lastHidden[h]) * this.learningRate);
        for (let h = 0; h < this.hiddenSize; h++) {
            for (let i = 0; i < this.inputSize; i++) {
                const deltaWeight = hiddenGradients[h] * this.lastInputs[i];
                this.weightsIH[h][i] += deltaWeight;
            }
            this.biasH[h] += hiddenGradients[h];
        }
    }
}
export { NeuralNetwork };