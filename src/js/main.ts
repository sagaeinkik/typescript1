//Hämta alla inputfält och knappar
const courseCodeInput = <HTMLInputElement>document.getElementById('kurskod');
const courseNameInput = <HTMLInputElement>document.getElementById('kursnamn');
const progressionInput = <HTMLInputElement>document.getElementById('progression');
const coursePlanInput = <HTMLInputElement>document.getElementById('kursplan');
const courseForm = <HTMLFormElement>document.querySelector('form');
const submitBtn = <HTMLInputElement>document.querySelector('input[type="submit"]');

//error
const error1 = <HTMLSpanElement>document.getElementById('error1');
const error2 = <HTMLSpanElement>document.getElementById('error2');
const error3 = <HTMLSpanElement>document.getElementById('error3');
const error4 = <HTMLSpanElement>document.getElementById('error4');

interface CourseInterface {
    kurskod: string;
    kursnamn: string;
    progression: string;
    kursplan: string;
}
//Håller koll på redigering:
let isEditing: boolean = false;

if (!isEditing) {
    submitBtn.addEventListener('click', (e: Event) => {
        addCourse(e);
    });
}
/* if(isEditing) {
    submitBtn.addEventListener("click", (e: Event) => {
        changeCourse(e); 
    })
} */
window.addEventListener('load', printCourses);

// Hämta befintliga kurser från localStorage, om det inte finns, skapa en tom lista
let courses: CourseInterface[] = JSON.parse(localStorage.getItem('courses') || '[]');

//Funktion som kollar om kurs finns
function uniqueCode(code: string): boolean {
    return courses.every((course) => course.kurskod !== code);
}

function addCourse(e: Event): void {
    e.preventDefault();

    const kurskod: string = courseCodeInput.value;
    const kursnamn: string = courseNameInput.value;
    const progression: string = progressionInput.value.toUpperCase();
    const kursplan: string = coursePlanInput.value;

    //Hitta index
    const index: number = courses.findIndex((course) => course.kurskod === kurskod);

    //Kolla om det är redigering eller inte, lägg till kursen då
    if (!isEditing) {
        //Felmeddelanden
        if (kurskod.length < 1) {
            error1.innerHTML = 'Du måste ange en kurskod';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = '';

            return;
        }
        if (!uniqueCode(kurskod)) {
            error1.innerHTML = 'Kurskoden måste vara unik';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = '';

            return;
        }
        if (kursnamn.length < 1) {
            error1.innerHTML = '';
            error2.innerHTML = 'Du måste ange ett kursnamn';
            error3.innerHTML = '';
            error4.innerHTML = '';
            return;
        }
        if (progression.length < 1) {
            error1.innerHTML = '';
            error2.innerHTML = '';
            error3.innerHTML = 'Du måste fylla i kursens progression.';
            error4.innerHTML = '';
            return;
        }
        if (progression !== 'A' && progression !== 'B' && progression !== 'C') {
            error1.innerHTML = '';
            error2.innerHTML = '';
            error3.innerHTML = 'Kursens progression måste vara A, B eller C';
            error4.innerHTML = '';
            return;
        }
        if (kursplan.length < 1) {
            error1.innerHTML = '';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = 'Du måste ange en länk till kursplanen.';
            return;
        }
        if (!kursplan.includes('http') || !kursplan.includes('.')) {
            error1.innerHTML = '';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = 'Kursplanen måste vara URL.';
            return;
        }

        //Ny kurs
        const newCourse: CourseInterface = {
            kurskod,
            kursnamn,
            progression,
            kursplan,
        };
        //lägg till i localstorage
        courses.push(newCourse);
        localStorage.setItem('courses', JSON.stringify(courses));
        resetFields();
    }
    printCourses();
}

function printCourses() {
    const courseList = <HTMLDivElement>document.querySelector('div.courselist');

    courseList.innerHTML = '';
    if (courses.length < 1) {
        courseList.innerHTML = '<p>Det finns inga kurser att visa ännu...</p>';
    } else {
        //Loopa igenom
        courses.forEach((kurs) => {
            //Skapa elementen:
            const courseDiv = <HTMLDivElement>document.createElement('div');
            courseDiv.classList.add('course');
            //Kurskod
            const codeP = <HTMLParagraphElement>document.createElement('p');
            codeP.appendChild(document.createTextNode(kurs.kurskod));
            courseDiv.appendChild(codeP);
            //Kursnamn
            const nameP = <HTMLParagraphElement>document.createElement('p');
            nameP.appendChild(document.createTextNode(kurs.kursnamn));
            courseDiv.appendChild(nameP);
            //Progression
            const progP = <HTMLParagraphElement>document.createElement('p');
            progP.appendChild(document.createTextNode(kurs.progression));
            courseDiv.appendChild(progP);
            //Url
            const linkA = <HTMLAnchorElement>document.createElement('a');
            linkA.href = kurs.kursplan;
            linkA.appendChild(document.createTextNode('Länk till kursplan'));
            courseDiv.appendChild(linkA);
            //Div runt knappar
            const controlsDiv = <HTMLDivElement>document.createElement('div');
            controlsDiv.classList.add('controls');
            //Knappar
            const editBtn = <HTMLButtonElement>document.createElement('button');
            editBtn.classList.add('change');
            editBtn.appendChild(document.createTextNode('Ändra kurs'));
            controlsDiv.appendChild(editBtn);
            const deleteBtn = <HTMLButtonElement>document.createElement('button');
            deleteBtn.classList.add('delete');
            deleteBtn.appendChild(document.createTextNode('Ta bort'));
            controlsDiv.appendChild(deleteBtn);
            courseDiv.appendChild(controlsDiv);

            //Span-element som avgränsning
            const span = <HTMLSpanElement>document.createElement('span');
            span.classList.add('divider');
            courseDiv.appendChild(span);
            courseList.appendChild(courseDiv);
        });
    }
}

function resetFields(): void {
    courseCodeInput.value = '';
    courseNameInput.value = '';
    progressionInput.value = '';
    coursePlanInput.value = '';

    error1.innerHTML = '';
    error2.innerHTML = '';
    error3.innerHTML = '';
    error4.innerHTML = '';

    courseCodeInput.select();
}
