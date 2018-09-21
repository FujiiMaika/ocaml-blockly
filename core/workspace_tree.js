'use strict';

goog.provide('Blockly.WorkspaceTree');

Blockly.WorkspaceTree = function(workspace) {
  this.workspace = workspace;
  this.children = Object.create(null);
};

Blockly.WorkspaceTree.Root = new Blockly.WorkspaceTree(null);

Blockly.WorkspaceTree.NodeMap_ = Object.create(null);

/**
 * Return a nested list of ids of workspace that pass the given filtering
 * rules.
 * @param {!Function} pred The function for a filtering rule.
 * @return {!Array} A list containing ids of workspace that pass the rule.
 */
Blockly.WorkspaceTree.filter = function(pred) {
  var lst = Blockly.WorkspaceTree.getChildren({id: 'root'});
  return lst.filter(pred);
};

/**
 * Add the workspace to the tree Blockly.WorkspaceTree.Root.
 * @param {!Blockly.Workspace} workspace Workspace to add to the root tree.
 */
Blockly.WorkspaceTree.add = function(workspace) {
  if (workspace.options.parentWorkspace) {
    var parentId = workspace.options.parentWorkspace.id;
    var parentNode = Blockly.WorkspaceTree.find(parentId);
  } else {
    var parentNode = Blockly.WorkspaceTree.Root;
  }
  var newNode = new Blockly.WorkspaceTree(workspace);
  parentNode.children[workspace.id] = newNode;
  Blockly.WorkspaceTree.NodeMap_[workspace.id] = newNode;
};

/**
 * Find the node of the given id from the root tree.
 * @param {!string} id The id of workspace to find.
 * @return {Blockly.WorkspaceTree}
 */
Blockly.WorkspaceTree.find = function(id) {
  if (id in Blockly.WorkspaceTree.NodeMap_) {
    return Blockly.WorkspaceTree.NodeMap_[id];
  }
  return null;
};

/**
 * Remove the workspace from the root of workspace tree.
 * @param {!Blockly.Workspace} workspace The workspace to delete.
 */
Blockly.WorkspaceTree.remove = function(workspace) {
  var id = workspace.id;
  var node = Blockly.WorkspaceTree.find(id);
  if (!node) {
    return;
  }
  delete Blockly.WorkspaceTree.NodeMap_[id];
  var parentNode = node.getParent_();
  if (parentNode) {
    delete parentNode.children[id];
  }
};

/**
 * Return the parent of this node.
 * @return {Blockly.WorkspaceTree} The parent of this node, or null.
 */
Blockly.WorkspaceTree.prototype.getParent_ = function() {
  if (this.workspace.options.parentWorkspace) {
    var parentId = this.workspace.options.parentWorkspace.id;
    var parentNode = Blockly.WorkspaceTree.find(parentId);
    return parentNode;
  }
  return null;
};

/**
 * Find the lowest common ancestor between the given 2 nodes.
 * @param {!Blockly.WorkspaceTree} node1
 * @param {!Blockly.WorkspaceTree} node2
 * @return {Blockly.WorkspaceTree} The lowest common ancestor between 2 nodes,
 *     if it exists. Otherwise null.
 */
Blockly.WorkspaceTree.lca_ = function(node1, node2) {
  var visited = Object.create(null);
  while (node1 && node1 != Blockly.WorkspaceTree.Root) {
    visited[node1.workspace.id] = true;
    node1 = node1.getParent_();
  }
  while (node2 && node2 != Blockly.WorkspaceTree.Root) {
    if (node2.workspace.id in visited) {
      return node2;
    }
    node2 = node2.getParent_();
  }
  return null;
};

/**
 * Find the lowest common ancestor between the given 2 workspaces.
 * @param {!Blockly.Workspace} workspace1
 * @param {!Blockly.Workspace} workspace2
 * @return {Blockly.Workspace} The lowest common workspace, or null.
 */
Blockly.WorkspaceTree.lowestCommon = function(workspace1, workspace2) {
  var node1 = Blockly.WorkspaceTree.find(workspace1.id);
  var node2 = Blockly.WorkspaceTree.find(workspace2.id);
  var lca = Blockly.WorkspaceTree.lca_(node1, node2);
  return lca ? lca.workspace : null;
};

/**
 * Return a list of workspace whose id is in the subtree.
 * @param {!Blockly.Workspace} workspace Workspace to specify the subtree.
 * @retrun {!Array} List of workspace.
 */
Blockly.WorkspaceTree.getChildren = function(workspace) {
  var subtree = Blockly.WorkspaceTree.find(workspace.id);
  var childrenWS = [];
  if (subtree) {
    var staq = [subtree];
    while (staq.length) {
      var n = staq.pop();
      var keys = Object.keys(n.children);
      for (var i = 0, childId; childId = keys[i]; i++) {
        var child = n.children[childId];
        childrenWS.push(child.workspace);
        staq.push(child);
      }
    }
  }
  return childrenWS;
};