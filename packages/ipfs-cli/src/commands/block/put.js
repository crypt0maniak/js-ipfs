'use strict'

const fs = require('fs')
const multibase = require('multibase')
const concat = require('it-concat')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')

module.exports = {
  command: 'put [block]',

  describe: 'Stores input as an IPFS block',

  builder: {
    format: {
      alias: 'f',
      describe: 'cid format for blocks to be created with.',
      default: 'dag-pb'
    },
    mhtype: {
      describe: 'multihash hash function',
      default: 'sha2-256'
    },
    mhlen: {
      describe: 'multihash hash length',
      default: undefined
    },
    version: {
      describe: 'cid version',
      type: 'number',
      default: 0
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    pin: {
      describe: 'Pin this block recursively',
      type: 'boolean',
      default: false
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.block
   * @param {import('multicodec').CodecName} argv.format
   * @param {import('multihashes').HashName} argv.mhtype
   * @param {number} argv.mhlen
   * @param {import('cids').CIDVersion} argv.version
   * @param {boolean} argv.pin
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print, getStdin }, block, timeout, format, mhtype, mhlen, version, cidBase, pin }) {
    let data

    if (block) {
      data = fs.readFileSync(block)
    } else {
      data = (await concat(getStdin(), { type: 'buffer' })).slice()
    }

    const { cid } = await ipfs.block.put(data, {
      timeout,
      format,
      mhtype,
      mhlen,
      version,
      pin
    })
    print(cidToString(cid, { base: cidBase }))
  }
}
