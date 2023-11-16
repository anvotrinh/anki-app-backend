function normalizeId(ret) {
  if (ret._id && typeof ret._id === "object" && ret._id.toString) {
    if (typeof ret.id === "undefined") {
      ret.id = ret._id.toString();
    }
    delete ret._id;
  }
}

function removePrivatePaths(ret, schema) {
  for (const path in schema.paths) {
    if (schema.paths[path].options && schema.paths[path].options.private) {
      if (typeof ret[path] !== "undefined") {
        delete ret[path];
      }
    }
  }
}

function removeVersion(ret) {
  if (typeof ret.__v !== "undefined") {
    delete ret.__v;
  }
}

function removeDeleted(ret) {
  if (typeof ret.deleted !== "undefined") {
    delete ret.deleted;
  }
}

export default function toJSON(schema) {
  let transform;
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc, ret) {
      removePrivatePaths(ret, schema);
      removeVersion(ret);
      normalizeId(ret);
      removeDeleted(ret);

      if (transform) {
        return transform(doc, ret);
      }
    }
  });
}
