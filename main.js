// Postfix++ Interpreter
// A simple stack-based interpreter for a postfix-like language with variable support
function PostfixInterpreter() {
  this.stack = [];
  this.symbolTable = new Map();

  this.isNumeric = function (t) {
    return !isNaN(parseFloat(t)) && isFinite(t);
  };

  this.isVariable = function (t) {
    return /^[A-Z]$/.test(t);
  };

  // Resolve variable or value
  this.resolve = function (t) {
    if (this.isNumeric(t)) return parseFloat(t);
    if (this.isVariable(t)) {
      if (!this.symbolTable.has(t)) throw new Error(`Variable ${t} is not defined.`);
      return this.symbolTable.get(t);
    }
    throw new Error(`Invalid token: ${t}`);
  };

  // Evaluate a line of Postfix++ code
  this.evaluate = function (line) {
    const tokens = line.trim().split(/\s+/);

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];

      if (this.isNumeric(tok) || this.isVariable(tok)) {
        this.stack.push(tok);

      } else if (tok === '=') {
        if (this.stack.length < 2) throw new Error("Assignment needs a variable and value.");
        const valT = this.stack.pop();
        const varT = this.stack.pop();
        if (!this.isVariable(varT)) throw new Error("LHS must be A-Z.");
        this.symbolTable.set(varT, this.resolve(valT));
        this.stack.length = 0;

      } else if (['+', '-', '*', '/'].includes(tok)) {
        if (this.stack.length < 2) throw new Error(`'${tok}' needs two operands.`);
        const b = this.resolve(this.stack.pop());
        const a = this.resolve(this.stack.pop());
        if (tok === '/' && b === 0) throw new Error("Division by zero.");
        const result = { '+': a + b, '-': a - b, '*': a * b, '/': a / b }[tok];
        this.stack.push(result);

      } else if (tok === 'PRINT') {
        if (!this.stack.length) throw new Error("Stack is empty.");
        console.log(this.stack[this.stack.length - 1]);

      } else if (tok === 'CLEAR') {
        this.stack.length = 0;

      } else if (tok === 'SHOWVARS') {
        if (!this.symbolTable.size) {
          console.log("No vars defined.");
        } else {
          this.symbolTable.forEach((v, k) => console.log(`${k} = ${v}`));
        }

      } else if (tok === 'DUP') {
        if (!this.stack.length) throw new Error("Stack is empty.");
        this.stack.push(this.stack[this.stack.length - 1]);

      } else if (tok === 'SWAP') {
        if (this.stack.length < 2) throw new Error("Need two items to swap.");
        const b = this.stack.pop();
        const a = this.stack.pop();
        this.stack.push(b, a);

      } else if (tok === 'DROP') {
        if (!this.stack.length) throw new Error("Stack is empty.");
        this.stack.pop();

      } else {
        throw new Error(`Unknown token: ${tok}`);
      }
    }
  };

  // Run interpreter with CLI
  this.run = function () {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    });

    console.log("Postfix++ Interpreter. Type 'exit' to quit.");
    rl.prompt();

    rl.on('line', (line) => {
      if (line.trim().toLowerCase() === 'exit') return rl.close();
      try {
        this.evaluate(line);
        console.log(`[${this.stack.join(', ')}]`);
      } catch (e) {
        console.error(`Error: ${e.message}`);
        this.stack.length = 0;
      }
      rl.prompt();
    }).on('close', () => {
      console.log('Goodbye.');
      process.exit(0);
    });
  };
}

// Create and run interpreter instance
const interpreter = new PostfixInterpreter();
interpreter.run();
