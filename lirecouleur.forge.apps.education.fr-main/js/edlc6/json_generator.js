/*
  EdLC6 - A blocky-based editor building WebLC6 profiles.
	Developed by M.-P. Brungard.
	Full details are avaliable at the Github repo: 
*/
"use strict";

const Order = {
  ATOMIC: 0,
};

const jsonGenerator = new Blockly.Generator("json");
Blockly.json = jsonGenerator;

//jsonGenerator = new Generator("json");
jsonGenerator.addReservedWords("true,false");

jsonGenerator.init = function (workspace) {
  jsonGenerator.variables_ = Object.create(null);
  /* if (!jsonGenerator.variableDB_) {
    jsonGenerator.variableDB_ = new Names(jsonGenerator.RESERVED_WORDS_);
  } else {
    jsonGenerator.variableDB_.reset();
  }*/
};
jsonGenerator.finish = function (code) {
  var variables = [];
  for (var name in jsonGenerator.variables_)
    variables.push(jsonGenerator.variables_[name]);
  if (variables.length) variables.push("\n");
  return code;
};
jsonGenerator.addVariable = function (varName, code, overwrite) {
  var overwritten = false;
  if (overwrite || jsonGenerator.variables_[varName] === undefined) {
    jsonGenerator.variables_[varName] = code;
    overwritten = true;
  }
  return overwritten;
};
jsonGenerator.scrub_ = function (block, code) {
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = jsonGenerator.blockToCode(nextBlock);
  return code + nextCode;
};
