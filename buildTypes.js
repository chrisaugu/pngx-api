const fs = require("fs/promises");
const { capitalize } = require("lodash");
const mongoose = require("mongoose");

const typeMap = {
  String: "String",
  Number: "Float",
  Boolean: "Boolean",
  Date: "String",
  ObjectId: "ID",
  Mixed: "JSON",
  Array: "[String]",
};

function mongooseTypeToGraphQL(schemaType) {
  const instance = schemaType.instance;
  if (instance === "Array") {
    const caster = schemaType.embeddedSchemaType;
    if (!caster) return "[String]";
    const inner = typeMap[caster.instance] || "String";
    return `[${inner}]`;
  }
  return typeMap[instance] || "String";
}

function generateCRUD(typeName) {
  const lower = typeName.charAt(0).toLowerCase() + typeName.slice(1);
  return `
type Query {
  ${lower}(id: ID!): ${typeName}
  ${lower}s(limit: Int, offset: Int): [${typeName}!]!
}

type Mutation {
  create${typeName}(input: ${typeName}Input!): ${typeName}!
  update${typeName}(id: ID!, input: ${typeName}Input!): ${typeName}
  delete${typeName}(id: ID!): Boolean!
}
  `.trim();
}
/**
 * generateTypeFromSchema
 * @param {string} typeName
 * @param {*} schema
 * @returns
 */
function generateTypeFromSchema(typeName, schema) {
  const fields = ["  id: ID!"];

  schema.eachPath((pathName, schemaType) => {
    if (pathName === "_id" || pathName === "__v") return;

    const graphqlType = mongooseTypeToGraphQL(schemaType);
    const required = schemaType.isRequired ? "!" : "";
    const fieldName = pathName.replace(/\./g, "_"); // flatten nested paths

    fields.push(`  ${fieldName}: ${graphqlType}${required}`);
  });

  return `type ${typeName} {\n${fields.join("\n")}\n}`;
}

const models = [
  require("./models/api-usage-log.model.js"),
  require("./models/company.model.js"),
  require("./models/indices.model.js"),
  require("./models/news-source.model.js"),
  require("./models/quote.model.js"),
  require("./models/ticker.model.js"),
  require("./models/webhook.model.js"),
];

const controller = new AbortController();
const { signal } = controller;

(async () => {
  for (const model of models) {
    try {
      const generatedType = generateTypeFromSchema(
        capitalize(model.modelName),
        model.schema,
      );
      console.log(generatedType);
      // const data = new Uint8Array(Buffer.from(generatedType));
      // const promise = fs.writeFile('./graphql/' + model.modelName.toLowerCase() + ".schema.graphql", data, { signal, encoding: 'utf8' });

      // // Abort the request before the promise settles.
      // // controller.abort();

      // await promise;
    } catch (e) {
      throw e;
    }
  }
})();
