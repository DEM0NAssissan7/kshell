/* Graphite Virtual Machine
    RISC archetecture [based on the Evergreen Architecture]
    One byte = 8 bits
    Configurable architecture size, RAM size, and CPU count

    Bit Architecture: undecided
    Clock speed: Depends on your computer

Set specs as needed.
*/

{

    let convert_to_binary = function (number) {
        return (number).toString(2);
    }
    let convert_to_decimal = function (binary) {
        return parseInt(binary, 2);
    }
    let convert_from_hex = function (hex) {
        return parseInt(hex, 16);
    }
    let append_value = function (target, binary) {
        for (let i = 0; i < binary.length; i++) {
            target.push(binary[i]);
        }
    }
    let VMIDs = 0;

    class CarboniteVM {
        constructor(ram_size, arch, CPUs) {
            //VM ID configuration
            this.id = VMIDs;
            //Size configurations
            this.arch = arch;
            this.cpus = CPUs;

            this.instruction_length = 4 + this.arch;
            this.increment = Math.floor(this.instruction_length / 8) + 1;

            //Initialize data sets
            this.ram = new Uint8Array(ram_size);
            this.reg = 0;
            this.cache = [];
            this.program_counter = 0;
            this.halt = false;

            /* Instruction set:
                0: LOD (reg = m) [0000]
                1: STR (m = reg) [0001]
                2: SET (reg = arg) [0010]
                3: ADD (reg += op) [0011]
                4: DMP (dump register contents through outputs) [0100]
                5: SUB (reg = XOR(reg, m) ) [0101]
                6: AND (reg = AND(reg, m)) [0110]
                7: BRC (pc = m) [0111]
                8: HLT (stop the CPU from executing) [1000]
            */
            this.instruction_set = [
                (arg) => {//LOD
                    this.reg = this.ram[arg];
                },
                (arg) => {//STR
                    this.ram[arg] = this.reg;
                },
                (arg) => {//SET
                    this.reg = arg;
                },
                (arg) => {//ADD
                    this.reg += arg;
                },
                () => {//DMP
                    console.log(this.reg);
                },
                (arg) => {//SUB
                    this.reg -= arg;
                },
                (arg) => {//AND
                    this.reg = (arg === this.reg);
                },
                (arg) => {//LRG
                    this.reg = (arg > this.reg);
                },
                (arg) => {//BRC
                    this.program_counter = arg;
                    return 0;
                },
                () => {//HLT
                    this.halt = true;
                }

            ];

            VMIDs++;
        }
        init() {
            console.log("VM " + this.id + " initialized");
        }
        print_debug() {
            console.log({
                cpus: this.cpus,
                ram: this.ram,
                reg: this.regs,
                id: this.id,
            });
        }
        instruct(op_code, arg_code) {
            /* 4 bit op code, 8-128 bit arg code */

            this.instruction_set[op_code](arg_code);
        }
        clock() {
            if (this.halt === false) {
                this.opcode_buffer = 0;
                for(let i = 1; i < this.increment; i++){
                    this.opcode_buffer += this.ram[this.program_counter + i];
                }
                let instruction_output = this.instruction_set[this.ram[this.program_counter]](this.opcode_buffer);

                if(instruction_output !== 0){
                    this.program_counter += this.increment;
                }
                if (this.program_counter >= this.ram.length) {
                    this.halt = true;
                }
            }
        }
        instruct_hex(op_code, arg_code) {
            this.instruction_set[convert_from_hex(op_code)](convert_from_hex(arg_code));
        }
        set_program(program) {
            /* Program Layout:
            - arch: x
            - data: [[op, arg],[op, arg],[op, arg],[op, arg]]
            MUST NOT USE HEX.
            */
            if (program.arch === this.arch) {
                for (let i = 0; i < program.data.length; i++) {
                    this.ram[i * this.increment] = program.data[i][0];
                    for(let l = 0; l < Math.floor(program.data[i][1]/255) + 1; l++){
                        this.ram[(i * this.increment) + l + 1] = Math.min(255, program.data[i][1] - (255 * l));
                    }
                }
            }
        }
        reset() {
            this.ram = new Uint8Array(this.ram.length);
            this.reg = 0;
            this.cache = [];
            this.program_counter = 0;
            this.halt = false;
        }
    }
    function createVM(ram_size, arch, CPUs) {
        return new CarboniteVM(ram_size, arch, CPUs);
    }
    function runVM(virtual_machine, max_time) {
        let _max_time = 10;
        if (max_time) {
            _max_time = max_time;
        }
        let start_time = Date.now() + (1000 / _max_time);
        while (Date.now() < start_time) {
            virtual_machine.clock();
        }
    }
    function convert_program_to_decimal(program) {

    }
}
let VM = createVM(128, 8, 1);
VM.init();
let test_program = {
    arch: 8,
    data: [
        [2, 100],//Set register to 100
        [3, 28],//Add 100 to register
        [1, 32],//Store register value in ram address 0x20
        [4, 0],//Print out register contents
        [0, 32],//Load ram address 0x20
        [8, 0],//Halt program
        [4, 0],//Print out register contents
        [7, 0],//Jump to ram address 0
    ]
}
let vm_kernel = {
    arch:8,
    data: [
        [7, 0],
        
    ]
}
VM.set_program(test_program);
VM.print_debug();
runVM(VM, 10);