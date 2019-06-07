const SHA256 = require('crypto-js/sha256');

class Block {
	constructor(data){
		this.id = 0;
    this.nonce = 144444;
  	this.body = data;
  	this.hash = "";
  }

  /**
   * Step 1. Implement `generateHash()`
   * method that return the `self` block with the hash.
   *
   * Create a Promise that resolve with `self` after you create
   *   the hash of the object and assigned to the hash property `self.hash = ...`
   *   블록의 해시임. 바디의 해시가 아니라.
   */
	//
	generateHash() {
    let self = this
    const promise = new Promise((resolve) => {
      self.hash = SHA256(JSON.stringify(self))
      resolve(self)
    })
    return promise
  }
}

// Exporting the class Block to be reuse in other files
module.exports.Block = Block;
