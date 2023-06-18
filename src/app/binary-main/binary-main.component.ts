import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';

@Component({
  selector: 'app-binary-main',
  templateUrl: './binary-main.component.html',
  styleUrls: ['./binary-main.component.scss'],
  encapsulation: ViewEncapsulation.None, //after rendring the tree need to apply styles again
})
export class BinaryMainComponent implements OnInit {
  @ViewChild('treeContainer', { static: true }) treeContainer!: ElementRef;
  constructor(private http: HttpClient) {}
  root: Node | null = null;
  addEnableFlag: boolean = true;
  rootFlag: boolean = false;
  isMatchedValue!: boolean;
  rootNode: any = '';
  deleteValue: any = '';
  selectedTraversal: string = '';
  traversalList: string[] = []; //to sore and view the traversals
  maxLevel: number = 5;
  previousMaxLevel: number = 5;
  colorBack!: string;
  searchValue!: string;

  /**
   * The ngOnInit function calls the displayTree and getData functions.
   */
  ngOnInit() {
    this.displayTree();
    this.getData();
  }

  /**
   * The function retrieves data from a specified URL and logs the response, sets the retrieved data as
   * the root, displays a tree, and sets a flag if the root is null.
   */
  getData() {
    const data = this.http
      .get<any>('https://bst-service.onrender.com/')
      .subscribe((Response) => {
        console.log(Response, 'res');
        this.root = Response;

        this.displayTree();

        if (this.root == null) {
          this.rootFlag = true;
        }
      });
  }

  /**
   * This function clears the input by setting the root and rootNode to null and displaying an alert if
   * no tree exists.
   */
  clearInput() {
    if (this.root) {
      if (confirm('Are you sure?')) {
        this.root = null;
        this.rootNode = null;
        this.displayTree();
        this.postIntoJson();
        this.rootFlag = true;
        console.log(this.root);
      }
    } else {
      alert('No Tree is Existed!');
    }
  }

  /**
   * This function renders a tree by setting the innerHTML of a container element with the result of
   * calling a renderTree function on the root node.
   */
  displayTree() {
    //to render tree
    const treeEl = this.treeContainer.nativeElement;
    if (treeEl) {
      treeEl.innerHTML = this.renderTree(this.root);
    }
  }

  /**
   * The function calls the highlightTree method with a search value as a parameter.
   */
  searchElement() {
    this.highlightTree(this.searchValue);
  }

  /**
   * This function highlights a specific element in a tree structure for a brief period of time.
   * @param {string} value - a string representing the value of a node in a tree data structure.
   */
  highlightTree(value: string) {
    const element = document.querySelector(
      '.nodeElement[nodevalue="' + value + '"]'
    );
    element?.classList.add('hightLight');
    setTimeout(() => {
      element?.classList.remove('hightLight');
    }, 2000);
  }

  /**
   * The function highlights the node with the minimum value in a binary search tree.
   */
  highMin() {
    this.highlightTree(this.findMinValue(this.root));
  }

  /**
   * The function highlights the node with the highest value in a binary tree.
   */
  highMax() {
    this.highlightTree(this.findMaxValue(this.root));
  }

  /**
   * The function deletes a node with a given value from a tree and displays the updated tree.
   * @param {string} value - string - the value of the node that needs to be deleted from the tree.
   */
  deleteElement(value: string): void {
    console.log('deleting');
    this.root = this.deleteNode(this.root, value);
    this.displayTree();
  }

  /**
   * The function removes a node from a binary search tree and updates the tree's display.
   */
  removeElement() {
    if (this.root) {
      this.root = this.deleteNode(this.root, this.deleteValue);
      if (this.countLevels(this.root) === 0) {
        this.rootFlag = true;
      }
      this.postIntoJson();
      this.deleteValue = '';
      this.displayTraversals();
      this.displayTree();
    }
  }

  /**
   * This function checks if a valid number is entered, creates a new node and adds it to the tree if
   * valid, and displays the updated tree and traversals.
   */
  onSubmit() {
    console.log(this.rootNode, 'nodes');
    const trimmedValue = this.rootNode.trim();
    if (/^-?\d+$/.test(trimmedValue)) {
      const newNode = new Node(this.rootNode);
      if (!this.root) {
        this.root = newNode;
        this.rootFlag = false;
        console.log('Root node created with value:', this.rootNode);
        this.postIntoJson();
      } else {
        this.addNode(this.root, newNode);
      }
      this.displayTree();
      this.displayTraversals();
      this.rootNode = '';
    } else {
      alert('Please enter a valid number');
    }
  }

  /**
   * This function deletes a node with a given value from a binary search tree.
   * @param {Node | null} root - The root node of the binary search tree from which a node with the
   * given value needs to be deleted.
   * @param {string} value - The value of the node that needs to be deleted from the binary search
   * tree.
   * @returns the updated root node of the binary search tree after deleting the node with the given
   * value.
   */
  deleteNode(root: Node | null, value: string): Node | null {
    if (!root) {
      this.displayPopup('Element not found in the tree.');
      return root;
    }

    // deleted value is smaller root goes to left tree
    if (value < root.value) {
      root.left = this.deleteNode(root.left, value);
    }
    // deleted value is larger root goes to right tree
    else if (value > root.value) {
      root.right = this.deleteNode(root.right, value);
    }
    // If the deleted value is  root, then this is the node to be deleted.
    else {
      // Case 1: deleted Node has no children (leaf node)
      if (!root.left && !root.right) {
        root = null;
      }
      // Case 2:deleted Node has only one child
      else if (!root.left) {
        root = root.right;
      } else if (!root.right) {
        root = root.left;
      }
      // Case 3:deleted Node has two children
      else {
        // Find the inorder successor (smallest value in the right subtree)
        const minValue = this.findMinValue(root.right);
        // Replace the node's value with the inorder successor value
        root.value = minValue;
        // Delete the inorder successor node recursively
        root.right = this.deleteNode(root.right, minValue);
      }
    }

    return root;
  }

  /**
   * This function finds the minimum value in a binary tree starting from the root node.
   * @param {Node | null} root - Node object representing the root of a binary search tree. The
   * function is intended to find and return the minimum value in the tree.
   * @returns The minimum value of the binary search tree rooted at the given `root` node is being
   * returned as a string.
   */
  findMinValue(root: Node | null): string {
    let minValue = root!.value;
    while (root && root.left) {
      minValue = root.left.value;
      root = root.left;
    }
    return minValue;
  }

  /**
   * This function finds and returns the maximum value in a binary tree.
   * @param {Node | null} root - Node object representing the root of a binary search tree. The function
   * is intended to find and return the maximum value in the tree.
   * @returns The maximum value in a binary search tree rooted at the given `root` node is being
   * returned as a string.
   */
  findMaxValue(root: Node | null): string {
    let maxValue = root!.value;
    while (root && root.right) {
      maxValue = root.right.value;
      root = root.right;
    }
    return maxValue;
  }

  displayPopup(message: string): void {
    alert(message);
  }

  /**
   * This function renders a binary tree structure as HTML elements.
   * @param {Node | null} node - The node parameter is of type Node or null, which represents a node in
   * a binary tree data structure. It contains a value and references to its left and right child nodes.
   * The renderTree function recursively renders the binary tree starting from the given node.
   * @returns A string containing HTML code representing a binary tree with clickable nodes. The HTML
   * code is generated recursively based on the input `node` parameter, which is an object representing
   * a node in the binary tree. The function uses template literals to generate the HTML code, and
   * includes conditional statements to check if the left and/or right child nodes exist, and if so,
   * recursively calls the `renderTree` function to
   */
  renderTree(node: Node | null): any {
    if (!node) {
      return '';
    }

    const { value, left, right } = node;

    return `
      <div class="nodeElement" data-clickable onclick="handleclick(${value})" nodeValue="${value}">${value}</div>
      ${
        left != null || right != null
          ? `
            <div class="nodeBottomLine"></div>
            <div class="nodeChild">
                ${
                  left
                    ? `
                  <div class="node nodeLeft">
                    ${this.renderTree(left)}
                  </div>
                  `
                    : ''
                }
                ${
                  right
                    ? `
                  <div class="node nodeRight">
                    ${this.renderTree(right)}
                  </div>
                  `
                    : ''
                }
            </div>
          `
          : ''
      }
    `;
  }

  /* The above code is a TypeScript function that listens for a click event on the document. When a
  click event occurs, it checks if the clicked element has a "data-clickable" attribute. If it does,
  it retrieves the value of the "nodeValue" attribute of the clicked element and prompts the user to
  confirm if they want to delete the element. If the user confirms, it sets the "deleteValue"
  property to the value of the "nodeValue" attribute and calls the "removeElement" function. */
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const desiredElement = target.closest('[data-clickable]');

    if (desiredElement) {
      console.log('Element is clicked');
      console.log(desiredElement.getAttribute('nodeValue'));
      if (
        confirm(
          `Are you sure you want to delete ${desiredElement.getAttribute(
            'nodeValue'
          )}?`
        )
      ) {
        this.deleteValue = desiredElement.getAttribute('nodeValue');
        this.removeElement();
      }
    }
  }

  /**
   * The function sets the maximum level of a tree and checks if it is valid, and enables or disables
   * adding nodes based on the current level of the tree.
   */
  setMaxLevel() {
    const currentLevelOfTree = this.countLevels(this.root);
    if (this.previousMaxLevel !== undefined && this.maxLevel !== undefined) {
      if (this.maxLevel > 10) {
        alert('Tree level should be less than 10');
        this.maxLevel = 10;
      }
      if (this.maxLevel > this.previousMaxLevel) {
        console.log('Value is increasing.');
      } else if (this.maxLevel < this.previousMaxLevel) {
        if (this.maxLevel < currentLevelOfTree) {
          alert('you cannot decrease the level while having the current tree');
          this.maxLevel = currentLevelOfTree;
          console.log(this.maxLevel);
        }
        console.log('Value is decreasing.');
      } else {
        console.log('Value remains the same.');
      }
    }
    this.previousMaxLevel = this.maxLevel;
    if (this.maxLevel >= currentLevelOfTree) {
      this.addEnableFlag = true;
    } else {
      this.addEnableFlag = false;
    }
  }

  /**
   * The function checks a flag based on the value of an HTML input element and creates a new node with
   * that value.
   * @param {Event} event - Event is a parameter that represents an event that has occurred, such as a
   * mouse click or a keyboard press. It is commonly used in web development to handle user
   * interactions with a webpage. In this specific code snippet, the event parameter is used to get the
   * value of an HTML input element that triggered the
   */
  checkFlag(event: Event) {
    const checkValue = (event.target as HTMLInputElement).value;
    // this.addEnableFlag = true;
    const newNode = new Node(checkValue);
    if (this.root) this.checkButtonFlag(this.root, newNode);
  }

  /**
   * The function checks if a new node can be added to a binary tree based on its value and the maximum
   * level allowed.
   * @param {Node} root - The root parameter is a Node object representing the root node of a binary
   * search tree.
   * @param {Node} newNode - A Node object representing the new node to be added to the binary search
   * tree.
   * @param {number} [level=1] - The level parameter is a number that represents the current level of
   * the binary tree being traversed. It is used to keep track of the depth of the tree and to limit
   * the maximum number of levels that can be added to the tree.
   * @returns The function does not have a return statement, so it returns undefined.
   */
  checkButtonFlag(root: Node, newNode: Node, level: number = 1) {
    if (level >= this.maxLevel) {
      console.log('Maximum levels reached. Cannot add more nodes.');
      this.addEnableFlag = false;
      return;
    }

    if (parseInt(newNode.value) < parseInt(root.value)) {
      if (!root.left) {
        this.addEnableFlag = true;
        //root.left = newNode;
        //console.log('Added node with value', newNode.value, 'to the left of', root.value);
      } else {
        this.checkButtonFlag(root.left, newNode, level + 1);
      }
    } else if (parseInt(newNode.value) > parseInt(root.value)) {
      if (!root.right) {
        this.addEnableFlag = true;
        //root.right = newNode;
        //console.log('Added node with value', newNode.value, 'to the right of', root.value);
      } else {
        this.checkButtonFlag(root.right, newNode, level + 1);
      }
    } else {
      //console.log('Node with value', newNode.value, 'already exists.');
    }
  }

  /**
   * This function adds a new node to a binary tree, checking if the value already exists and alerting
   * if the maximum level is reached.
   * @param {Node} root - The root node of the binary search tree.
   * @param {Node} newNode - The node that needs to be added to the binary search tree.
   * @param {number} [level=1] - The level parameter is used to keep track of the current level of the
   * binary search tree while traversing it. It is an optional parameter with a default value of 1.
   * @returns If the function reaches the maximum level, it will return nothing (undefined). If the
   * value being added already exists in the tree, it will also return nothing. Otherwise, it will add
   * the new node to the tree and call the `postIntoJson()` method, but it will not return anything.
   */
  addNode(root: Node, newNode: Node, level: number = 1) {
    if (level >= this.maxLevel) {
      alert('Reached Max Level');
      return;
    }

    if (parseInt(newNode.value) < parseInt(root.value)) {
      if (!root.left) {
        root.left = newNode;
        this.postIntoJson();
      } else {
        this.addNode(root.left, newNode, level + 1);
      }
    } else if (parseInt(newNode.value) > parseInt(root.value)) {
      if (!root.right) {
        root.right = newNode;
        this.postIntoJson();
      } else {
        this.addNode(root.right, newNode, level + 1);
      }
    } else {
      alert('Value is already existed');
    }
  }

  /**
   * This function sends a POST request to a specified URL with data in JSON format and logs the
   * response.
   * @returns The `postIntoJson()` function is returning a subscription object from the `http.post()`
   * method. However, since the function is not returning the subscription object directly, but rather it
   * is being returned from within the `subscribe()` method, the actual return value of the function is
   * `undefined`.
   */
  postIntoJson() {
    console.log(this.root, 'data');
    return this.http
      .post<any>('https://bst-service.onrender.com/', this.root)
      .subscribe((Respons) => {
        console.log(Respons, 'res');
      });
  }

  /**
   * This function displays the selected traversal of a binary tree, if it exists, and logs an error
   * message if the root node does not exist.
   */

  displayTraversals() {
    if (this.root) {
      console.log(this.root);

      if (this.selectedTraversal == 'inorder') {
        console.log('Inorder Traversal:');
        this.traversalList = [];
        this.inorderTraversal(this.root);
        console.log(this.root);
      } else if (this.selectedTraversal == 'preorder') {
        console.log('Preorder Traversal:');
        this.traversalList = [];
        this.preorderTraversal(this.root);
      } else if (this.selectedTraversal == 'postorder') {
        console.log('Postorder Traversal:');
        this.traversalList = [];
        this.postorderTraversal(this.root);
      }
    } else {
      // this.treeStructure = [];
      console.log('Root node does not exist.');
    }
  }

  //to display the tree in console
  // generateTreeStructure(node: Node | null, level: number, position: number) {
  //   if (node) {
  //     this.treeStructure.push({ value: node.value, level, position });
  //     this.generateTreeStructure(node.left, level + 1, position * 2);
  //     this.generateTreeStructure(node.right, level + 1, position * 2 + 1);
  //   }
  // }

  /**
   * This function performs an inorder traversal of a binary tree and logs the node values to the
   * console.
   * @param {Node | null} node - The parameter `node` is of type `Node | null`, which means it can either
   * be a `Node` object or `null`. This function is used to traverse a binary tree in an inorder manner,
   * which means it visits the left subtree, then the root node, and then the right subtree
   */

  inorderTraversal(node: Node | null) {
    if (node) {
      this.inorderTraversal(node.left);
      console.log(node.value);
      this.traversalList.push(node.value);
      this.inorderTraversal(node.right);
    }
  }

  /**
   * This function performs a preorder traversal of a binary tree and logs the node values to the
   * console while also adding them to a traversal list.
   * @param {Node | null} node - The parameter `node` is a reference to a binary tree node. It can
   * either be a valid node object or `null`. The function `preorderTraversal` performs a preorder
   * traversal of the binary tree starting from the given node.
   */
  preorderTraversal(node: Node | null) {
    if (node) {
      console.log(node.value);
      this.traversalList.push(node.value);
      this.preorderTraversal(node.left);
      this.preorderTraversal(node.right);
    }
  }

  /**
   * This function performs a postorder traversal of a binary tree and logs the node values in the
   * console.
   * @param {Node | null} node - Node object or null value.
   */
  postorderTraversal(node: Node | null) {
    if (node) {
      this.postorderTraversal(node.left);
      this.postorderTraversal(node.right);
      console.log(node.value);
      this.traversalList.push(node.value);
    }
  }

  /* The above code is a method in a TypeScript class that counts the number of levels in a binary tree.
 It takes in a node and a level (which is optional and defaults to 0) as parameters. It recursively
 traverses the left and right subtrees of the node and returns the maximum level between the left
 and right subtrees. If the node is null, it returns the current level. */
  countLevels(node: Node | null, level: number = 0): number {
    if (!node) {
      return level;
    }

    const leftLevel = this.countLevels(node.left, level + 1);
    const rightLevel = this.countLevels(node.right, level + 1);

    return Math.max(leftLevel, rightLevel);
  }
}

/* The class Node represents a node in a binary tree with a string value and left and right child
nodes. */
class Node {
  constructor(public value: string) {
    this.left = null;
    this.right = null;
  }
  left: Node | null;
  right: Node | null;
}
