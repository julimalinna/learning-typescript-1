// Project state management
class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;
  private constructor() {

  }

  static getInstance() {
    if (this.instance) return this.instance;
  
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFunction: Function) {
    this.listeners.push(listenerFunction);
  }

  addProject(title: string, description: string, peopleAmount: number) {
    const newProject = {
      id: Math.random().toString(),
      title,
      description,
      peopleAmount,
    };

    this.projects.push(newProject);
    this.listeners.forEach(listenerFunction => listenerFunction(this.projects.slice()));
  }
}
const projectState = ProjectState.getInstance();

// Validation
interface IValidationText {
  value: string;
  required?: boolean;
  minLength: number;
  maxLength: number;
}

function isValidInput(validationInput: IValidationText) {
  const inputLength = validationInput.value.trim().length;
  const { required, minLength, maxLength } = validationInput;

  if (!required) return true;
  if (!inputLength) return false;
  if (inputLength < minLength || inputLength > maxLength) return false;
  return true;
}

// decorators
function autoBind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFunction = originalMethod.bind(this);
      return boundFunction;
    }
  };
  return adjustedDescriptor;
};

//ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  sectionElement: HTMLElement;
  assignedProjects: any[];

  constructor(private type: 'Active' | 'Finished') {
    this.templateElement = document.getElementById(
      'project-list'
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.sectionElement = importedNode.firstElementChild as HTMLElement;
    this.sectionElement.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });
  
    this.renderDOM();
    this.renderDOMContent();
  }

  private renderProjects() {
    const listElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    this.assignedProjects.forEach((project) => {
      const listItem = document.createElement('li');
      listItem.textContent = project.title;
      listElement.appendChild(listItem);
    });
  }

  private renderDOMContent() {
    const listId = `${this.type}-project-list`;
    this.sectionElement.querySelector('ul')!.id = listId;
    this.sectionElement.querySelector('h2')!.textContent = this.type + ' projects';
  }
  private renderDOM() {
    this.hostElement.insertAdjacentElement('beforeend', this.sectionElement);
  }
}

// ProjectInput Class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    formElement: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleAmountInputElement: HTMLInputElement;
  
    constructor() {
      this.templateElement = document.getElementById(
        'project-input'
      )! as HTMLTemplateElement;
      this.hostElement = document.getElementById('app')! as HTMLDivElement;
  
      const importedNode = document.importNode(
        this.templateElement.content,
        true
      );
      this.formElement = importedNode.firstElementChild as HTMLFormElement;
      this.formElement.id = 'user-input';

      this.titleInputElement = this.formElement.querySelector('#title') as HTMLInputElement;
      this.descriptionInputElement = this.formElement.querySelector('#description') as HTMLInputElement;
      this.peopleAmountInputElement = this.formElement.querySelector('#people') as HTMLInputElement;

      this.addEventListeners();
      this.renderDOM();
    }
  
    private gatherUserInput():[string, string, number] | void {
      const titleValue = this.titleInputElement.value;
      const descriptionValue = this.descriptionInputElement.value;
      const peopleAmountValue = Number(this.peopleAmountInputElement.value);

      const titleValidationRequirements: IValidationText = {
        value: titleValue,
        required: true,
        minLength: 5,
        maxLength: 50,
      };
      const descriptionValidationRequirements: IValidationText = {
        value: descriptionValue,
        required: true,
        minLength: 10,
        maxLength: 50,
      };

      if (
        !isValidInput(titleValidationRequirements) ||
        !isValidInput(descriptionValidationRequirements) ||
        peopleAmountValue < 1
      ) {
        alert('Please fill out all the inputs');
        return;
      } else {
        return [titleValue, descriptionValue, peopleAmountValue];
      }
    }
  
    private clearInputs() {
      this.titleInputElement.value = '';
      this.descriptionInputElement.value = '';
      this.peopleAmountInputElement.value = '';
    }
  
    @autoBind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userInput = this.gatherUserInput();
      if (userInput) {
        const [titleValue, descriptionValue, peopleAmountValue] = userInput;

        projectState.addProject(titleValue, descriptionValue, peopleAmountValue);
        this.clearInputs();
      }
    }
  
    private addEventListeners() {
      this.formElement.addEventListener('submit', this.submitHandler);
    }
  
    private renderDOM() {
      this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
  }
  
new ProjectInput();
new ProjectList('Active');
new ProjectList('Finished');
