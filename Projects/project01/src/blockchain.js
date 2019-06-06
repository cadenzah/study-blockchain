/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message`
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to
     * create the `block hash` and push the block into the chain array. Don't for get
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention
     * that this method is a private method.
     */

     // 1. 처음 인자로 전달받는 block에는 데이터만 들어있고 그 외에는 다 초기값만 들어있다 (빈 값들)
     //     // block.hash 에는 null 이 들어있다는 사실에 유의하자
     //    따라서 여기서 기타 메타값들 (이전 해시, 시간, height)을 추가하고,
    //     마지막으로 해시값을 구해서 block.hash에 추가하자
    _addBlock(block) {
        let self = this;

        return new Promise(async (resolve, reject) => {

            block.height = self.height + 1
            block.previousBlockHash = (self.height >= 0) ? self.chain[self.height].hash : null
            block.time = new Date().getTime().toString().slice(0, -3)
            const newHash = SHA256(JSON.stringify(block)).toString()
            block.hash = newHash
            self.chain[block.height] = block
            self.height = block.height

            resolve(block)
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address
     */

     // 사용자가 자신의 지갑 주소를 보내주면, 이 주소를 집어넣어서 서버가 미리 정해진 양식으로 메세지를 반환 (서명 없음)
     // 돌려받은 메세지로 사용자는 지갑 측에서 서명을 시작하게 된다.
       // - 메세지를 서명하는 것. 그래서 메세지 원본과 서명은 함께 Block에 추가된다.
       // - 서명할 때에 지갑이 필요 (Private Key) - 이걸로 서명한 것은 지갑 주소로 열 수 있다 (Grandchild Public Key)
     // 이 메세지를 가지고 Star 객체, 즉 블록을 서버로 전송할 때에 사용한다
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            const msg = `${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`
            resolve(msg)
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address
     * @param {*} message
     * @param {*} signature
     * @param {*} star
     */

     // 1. 소유권 요청 시간을 먼저 구한다
     // 2. 현재 시간을 구한다 (Star submit의 시간)
        // - 주의! 현재 시간을 프라미스 함수 바깥에서 구하면 5분이 픽스되어버린다.
     // 3. 1과 2의 차이가 5분 이내인지 구한다
     // 4. 메시지 내용을 지갑 주소와 서명을 기반으로 검증한다 (BitcoinMessage 활용)
     // 5. 다 통과했으면, 블록을 만들고 체인에 추가한다
     // 6. 추가된 블록을 반환한다 (resolve)
    submitStar(address, message, signature, star) {
        let self = this;
        const messageTime = parseInt(message.split(':')[1])
        const item = { address, message, signature, star }
        return new Promise(async (resolve, reject) => {
          const currentTime = parseInt(new Date().getTime().toString().slice(0, -3))

          if (currentTime - messageTime >= 5 * 60) reject()
          else if (bitcoinMessage.verify(message, address, signature)) {
              // add block and resolve
              const newBlock = new BlockClass.Block({ data: item })
              resolve(self._addBlock(newBlock))
          } else reject("verification wrong...?")
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            const searchResult = self.chain.reduce((result, current) => {
                if (current.hash === hash) return current
            }, null)
            if (searchResult) resolve(searchResult)
            else resolve(null)
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object
     * with the height equal to the parameter `height`
     * @param {*} height
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address
     */
    getStarsByWalletAddress (address) {
        let self = this;
        // let stars = [];
        return new Promise((resolve, reject) => {
            const data = self.chain.filter((block) => {
              const blockData = block.getBData()
              if (blockData.address && blockData.address === address) return true
              else false
            })
            // console.log(data)
            const stars = data.map((each) => {
              return each.getBData().star
            })

            resolve(stars)
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            self.chain.map((block, index) => {
                if (block.validate()) errorLog.push(`Block ${index} is tampered`)
            })
            resolve(errorLog)
        });
    }

}

module.exports.Blockchain = Blockchain;
