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
   * ngOnInit()
   * Angular lifecycle hook called after the component is initialized.
   * It calls the `displayTree()` ` methods and retrieves data from an API using `getData()`.
   */
  ngOnInit() {
    this.displayTree();
    this.getData();
  }
  /**
   * getData()
   * Retrieves the binary tree data from an API using the Angular `HttpClient` and assigns the response to the `root` property.
   * If the `root` is `null`, it sets the `rootFlag` to `true`.
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
   * clearInput()
   * Clears the input values and resets the binary tree.
   * If the user confirms the action, it sets the `root` to `null`, `rootNode` to `null`, and `rootFlag` to `true`.
   * It also calls the `displayTree()` and `postIntoJson()` methods.
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
   * displayTree()
   * Renders and displays the binary tree in the DOM.
   * It uses the `renderTree()` method to generate the HTML content and updates the `treeContainer` element.
   */
  displayTree() {
    //to render tree
    const treeEl = this.treeContainer.nativeElement;
    if (treeEl) {
      treeEl.innerHTML = this.renderTree(this.root);
    }
  }

  /**
   * searchElement()
   * Searches for a given value in the binary tree and highlights the corresponding node in the DOM by adding a CSS class.
   * It calls the `highlightTree()` method.
   */
  searchElement() {
    this.highlightTree(this.searchValue);
  }

  /**
   * highlightTree(value: string)
   * Highlights a node with the specified value by adding a CSS class.
   * It selects the element using the value attribute and adds the `highlight` class.
   * After a delay of 2 seconds, it removes the `highlight` class.
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

  /**HighMin()
   * Highlight the Minimum Character in the tree
   */

  highMin() {
    this.highlightTree(this.findMinValue(this.root));
  }
  /**HighMax()
   * Highlight the Maximum Character in the tree
   */
  highMax() {
    this.highlightTree(this.findMaxValue(this.root));
  }

  /**
   * deleteElement(value: string)
   * Deletes a node with the specified value from the binary tree.
   * It calls the `deleteNode()` method and updates the tree by calling `displayTree()`.
   */
  deleteElement(value: string): void {
    console.log('deleting');
    this.root = this.deleteNode(this.root, value);
    this.displayTree();
  }

  /**removeElement()
   * The removeElement method removes a node with the specified value from the binary tree.
   * It calls the deleteNode method, updates the tree, and checks if the root is null to set the rootFlag accordingly. */
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

  /**onSubmit()
   * The onSubmit method is triggered when a form is submitted to
   * add a new node to the binary tree. It creates a new Node instance
   * and adds it to the tree using the addNode method. */
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
   * deleteNode(node: Node | null, value: string)
   * Deletes a node with the specified value from the binary tree.
   * It recursively traverses the tree to find the node to delete and performs the deletion.
   * It updates the `root` property if the root node is deleted.
   */

  deleteNode(root: Node | null, value: string): Node | null {
    if (!root) {
      this.displayPopup('Element not found in the tree.');
      this.rootFlag = true;
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

  //find the minimum value in a BST
  findMinValue(root: Node | null): string {
    let minValue = root!.value;
    while (root && root.left) {
      minValue = root.left.value;
      root = root.left;
    }
    return minValue;
  }

  //find the maximum value in a BST
  findMaxValue(root: Node | null): string {
    let maxValue = root!.value;
    while (root && root.right) {
      maxValue = root.right.value;
      root = root.right;
    }
    return maxValue;
  }

  // Function to display a popup message
  displayPopup(message: string): void {
    alert(message);
  }

  /**
   * renderTree(node: Node | null)
   * Recursively generates the HTML content for the binary tree starting from the specified `node`.
   * It returns the HTML content as a string.
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

  //to delete the value on click the element
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
   * SetMaxLevel()
   * with comparing the previous maxvalue it setting the current maxvalue for tree to rendered.
   * and the maxDepath of the tree is 10
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
   * checkFlag(event:Event)
   * Checking the flag to set true or false by Tree childern
   * In the depath if the childern can be stored it can enable 
   * if the root goes more than maxDeapth then it controls the button
   * by calling checkButtonFlag
   */
  checkFlag(event: Event) {
    const checkValue = (event.target as HTMLInputElement).value;
    // this.addEnableFlag = true;
    const newNode = new Node(checkValue);
    if (this.root) this.checkButtonFlag(this.root, newNode);
  }

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
   * addNode(root :Node, newNode:Node, level:number =1 )
   * adding the node by checking the level of tree if it reached it shows popup which is reacched max level
   * if not it checking wheather the value is smaller ot larger
   * if smaller it calling addnode with left root
   * if larger it caling addnode with rightroot 
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
      alert('Value is already existed')
    }
  }

  /**
   * postIntoJson()
   * Retrieves the binary tree data from an API using the Angular `HttpClient` and assigns the response to the `root` property.
   * If the `root` is `null`, it sets the `rootFlag` to `true`.
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
   * displayTraversals()
   * Checking the variable with which order needs to be called by passing the argument value
   * before calling the traversal its making  inOrderTraversal list empty to store the new values
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
   * inOrderTraversal(node:Node | null)
   * Methods which returns the tree in form of inorder practise
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
   * preOrderTraversal(node:Node | null)
   * Methods which returns the tree in form of preorder practise
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
   * postOrderTraversal(node:Node | null)
   * Methods which returns the tree in form of postorder practise
   */
  postorderTraversal(node: Node | null) {
    if (node) {
      this.postorderTraversal(node.left);
      this.postorderTraversal(node.right);
      console.log(node.value);
      this.traversalList.push(node.value);
    }
  }

  //To check the current level of tree by calling the countLevel() function
  checkLevel() {
    console.log('level of tree is : ', this.countLevels(this.root));
  }
  /**
   * 
   * countLevels(node:Node |null, level) 
   * the countLevel is couting the current tree deapth
   * returns the number
   */
  countLevels(node: Node | null, level: number = 0): number {
    if (!node) {
      return level;
    }

    const leftLevel = this.countLevels(node.left, level + 1);
    const rightLevel = this.countLevels(node.right, level + 1);

    return Math.max(leftLevel, rightLevel);
  }
}
/**
 * defining Node with attributes
 * {
 * value:string,
 * left:Node|null,
 * right:Node|null,
 * }
 */
class Node {
  constructor(public value: string) {
    this.left = null;
    this.right = null;
  }
  left: Node | null;
  right: Node | null;
}
