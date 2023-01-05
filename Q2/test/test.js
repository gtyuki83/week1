const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("HelloWorld", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Circuit should multiply two numbers correctly", async function () {
        const circuit = await wasm_tester("contracts/circuits/HelloWorld.circom");

        const INPUT = {
            "a": 2,
            "b": 3
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(6)));

    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        // This code defines witness(={"a":"2","b":"3"}), wasm(=HelloWorld.wasm), and zkey(=circuit_final.zkey)
        // groth16.fullProve function digitally signs the given data (witness) and returns the proof and publicSignals required for verification. proof represents the digital signature information required for verification. publicSignals represents the public signal required for verification. publicSignals represents the public signals required for verification.
        const { proof, publicSignals } = await groth16.fullProve({"a":"2","b":"3"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // The console.log function is used to output the first element of the publicSignals array. the publicSignals array contains the results output by the digitally signed contract. In this example, the value of publicSignals[0] is output, so "2x3 =" is followed by the value of publicSignals[0].
        console.log('2x3 =',publicSignals[0]);
        
        // The groth16.exportSolidityCallData function is called to generate Solidity call data using proof and publicSignals. The call data is data to be passed to the verifier smart contract of the aggregator for verification.
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    
        // To extract a string from the calldata variable, remove all "", "[", "]", and spaces in the string using a regular expression. The deleted string is divided by commas into an array.
        // Then, each element of the array is converted to a string using the BigInt function. This allows the creation of arrays of numbers.
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // This array of numbers is stored in the a, b, c, and Input variables, respectively. a, b, c, and Input variables are arguments used in the verifier smart contract of the adder.
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // The verifier smart contract's verifyProof function is called, passing the a, b, c, and Input variables as arguments for verification. verifyProof function performs verification using the given arguments, and if the result of verification is true, the verification is considered successful. If the result of the verification is true, the verification is deemed to have succeeded.
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;
    
    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Circuit should multiply three numbers correctly", async function () {
        //[assignment] insert your script here
        const circuit = await wasm_tester("contracts/circuits/Multiplier3.circom");

        const INPUT = {
            "a": 2,
            "b": 3,
            "c": 4
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        //console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(12)));
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"2","b":"3","c":"4"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('2x3x4 =',publicSignals[0]);
        
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
    });
    
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
    });
});