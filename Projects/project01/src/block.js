/**
 *                          Block class
 *  The Block class is a main component into any Blockchain platform,
 *  it will store the data and act as a dataset for your application.
 *  The class will expose a method to validate the data... The body of
 *  the block will contain an Object that contain the data to be stored,
 *  the data should be stored encoded.
 *  All the exposed methods should return a Promise to allow all the methods
 *  run asynchronous.
 */

const SHA256 = require('crypto-js/sha256');
const hex2ascii = require('hex2ascii');

class Block {

    // Constructor - argument data will be the object containing the transaction data
	constructor(data){
		this.hash = null;                                           // Hash of the block
		this.height = 0;                                            // Block Height (consecutive number of each block)
		this.body = Buffer(JSON.stringify(data)).toString('hex');   // Will contain the transactions stored in the block, by default it will encode the data
		this.time = 0;                                              // Timestamp for the Block creation
		this.previousBlockHash = null;                              // Reference to the previous Block Hash
    }

    /**
     *  validate() method will validate if the block has been tampered or not.
     *  Been tampered means that someone from outside the application tried to change
     *  values in the block data as a consecuence the hash of the block should be different.
     *  Steps:
     *  1. Return a new promise to allow the method be called asynchronous.
     *  2. Save the in auxiliary variable the current hash of the block (`this` represent the block object)
     *  3. Recalculate the hash of the entire block (Use SHA256 from crypto-js library)
     *  4. Compare if the auxiliary hash value is different from the calculated one.
     *  5. Resolve true or false depending if it is valid or not.
     *  Note: to access the class values inside a Promise code you need to create an auxiliary value `let self = this;`
     */

     // 어떤 블록이 조작되지 않았나 확인
     // 1. 현재의 해시값을 임시로 저장해둔다
     // 2. 새로운 해시를 구하고, 이전 해시값과 다른지 비교한다
        // 이 때, 블록 내에 해시값은 항상 일관성있게 비워야 한다. 여기서는 `null`을 부여했다.
        // 그래서 매번 해시를 구하더라도 해시값이 동일하도록 하고, 해시 결과는 수동으로 나중에 저장
     // 3. Note: 프라미스 내에서 바깥 함수의 this에 접근하려면 self 사용이 필요
    validate() {
        let self = this;
        return new Promise((resolve, reject) => {
            // Save in auxiliary variable the current block hash
            const previousHash = self.hash
            self.hash = null
            // Recalculate the hash of the Block
            // Comparing if the hashes changed
            // Returning the Block is not valid
            const newHash = SHA256(JSON.stringify(self)).toString()

            // put back the original hash so that hash value is not null
            self.hash = previousHash

            // Returning the Block is valid
            if (previousHash === newHash) resolve(true)
            else resolve(false)
        });
    }

    /**
     *  Auxiliary Method to return the block body (decoding the data)
     *  Steps:
     *
     *  1. Use hex2ascii module to decode the data
     *  2. Because data is a javascript object use JSON.parse(string) to get the Javascript Object
     *  3. Resolve with the data and make sure that you don't need to return the data for the `genesis block`
     *     or Reject with an error.
     */
    getBData() {
        // Getting the encoded data saved in the Block
        // Decoding the data to retrieve the JSON representation of the object
        // Parse the data to an object to be retrieve.
        const dataObject = JSON.parse(hex2ascii(this.body))

        // Resolve with the data if the object isn't the Genesis block
        if ( dataObject.data === 'Genesis Block' ) return ''
        else return dataObject.data
    }

}

module.exports.Block = Block;                    // Exposing the Block class as a module
