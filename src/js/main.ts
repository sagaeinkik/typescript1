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
let isEditing: boolean | null = null;

//Lägg på event listener om isEditing är false eller null
if (!isEditing) {
    submitBtn.addEventListener('click', (e: Event) => {
        addCourse(e);
    });
}
//Skriv ut kurser från localstorage när fönstret har laddat
window.addEventListener('load', printCourses);

// Hämta befintliga kurser från localStorage, om det inte finns, skapa en tom lista, lagra globalt
let courses: CourseInterface[] = JSON.parse(localStorage.getItem('courses') || '[]');

//Funktion som kollar om kurskod finns
function uniqueCode(code: string): boolean {
    return courses.every((course) => course.kurskod !== code);
}

//Funktion som lägger till kurser
function addCourse(e: Event): void {
    e.preventDefault();
    //Lagra värdena från input
    const kurskod: string = courseCodeInput.value;
    const kursnamn: string = courseNameInput.value;
    const progression: string = progressionInput.value.toUpperCase();
    const kursplan: string = coursePlanInput.value;

    //Hitta index
    const index: number = courses.findIndex((course) => course.kurskod === kurskod);

    //Kolla om det är redigering eller inte, lägg till kursen då
    if (!isEditing) {
        //Felmeddelanden
        //Fältet är tomt
        if (kurskod.length < 1) {
            error1.innerHTML = 'Du måste ange en kurskod';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = '';

            return;
        } //Ej unik kurskod
        if (!uniqueCode(kurskod)) {
            error1.innerHTML = 'Kurskoden måste vara unik';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = '';

            return;
        }
        //Fältet är tomt
        if (kursnamn.length < 1) {
            error1.innerHTML = '';
            error2.innerHTML = 'Du måste ange ett kursnamn';
            error3.innerHTML = '';
            error4.innerHTML = '';
            return;
        }
        //Fältet är tomt
        if (progression.length < 1) {
            error1.innerHTML = '';
            error2.innerHTML = '';
            error3.innerHTML = 'Du måste fylla i kursens progression.';
            error4.innerHTML = '';
            return;
        }
        //Progression är inte A, b eller c (jag gick efter uppgiftsbeskrivningen och inte forumet, sorry)
        if (progression !== 'A' && progression !== 'B' && progression !== 'C') {
            error1.innerHTML = '';
            error2.innerHTML = '';
            error3.innerHTML = 'Kursens progression måste vara A, B eller C';
            error4.innerHTML = '';
            return;
        }
        //Fältet är tomt
        if (kursplan.length < 1) {
            error1.innerHTML = '';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = 'Du måste ange en länk till kursplanen.';
            return;
        }
        //inte url
        if (!kursplan.includes('http') || !kursplan.includes('.')) {
            error1.innerHTML = '';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = 'Kursplanen måste vara URL.';
            return;
        }

        //Om allt gått bra hittills:
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
    //skriv ut kurser till DOM
    printCourses();
}

//Funktion som skriver ut kurserna
function printCourses(): void {
    const courseList = <HTMLDivElement>document.querySelector('div.courselist');
    //Rensa listan först
    courseList.innerHTML = '';
    //Meddelande om det inte finns kurser
    if (courses.length < 1) {
        courseList.innerHTML = '<p>Det finns inga kurser att visa ännu...</p>';
    } else {
        //Loopa igenom
        courses.forEach((kurs, index) => {
            //Skapa ett index så man kan ta bort kurser i slumpmässig ordning
            const courseId: string = `course_${index}`;
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

            //Händelselyssnare på knapparna
            //ÄNDRA KURS
            editBtn.addEventListener('click', (e: Event) => {
                //fyll i inputfälten med värden från kursen
                loadValues(kurs);
                //Ändra editing till true
                isEditing = true;
                //Ändra knapptext
                submitBtn.value = 'Spara ändringar';
                //Ta bort addcourse från knapp, lägg till changecourse istället
                submitBtn.removeEventListener('click', addCourse);
                submitBtn.addEventListener('click', () => {
                    changeCourse(e, kurs);
                });
            });

            // TA BORT KURSER
            deleteBtn.addEventListener('click', () => {
                //Hitta index som matchar det index vi har tilldelat kursen
                const deleteIndex = courses.findIndex(
                    (course) => `course_${courses.indexOf(course)}` === courseId
                );
                //Klipp ut kursen ur arrayen
                courses.splice(deleteIndex, 1);
                //Uppdatera storage
                localStorage.setItem('courses', JSON.stringify(courses));
                //Ta bort div som tillhör kurs
                courseDiv.remove();
            });
        });
    }
}

//Fyll i inputfält med värdena från kursen
function loadValues(kurs: CourseInterface): void {
    courseCodeInput.value = kurs.kurskod;
    courseNameInput.value = kurs.kursnamn;
    progressionInput.value = kurs.progression;
    coursePlanInput.value = kurs.kursplan;
}

// Funktion för att skriva över befintlig kurs med ny information
function changeCourse(e: Event, kurs: CourseInterface) {
    e.preventDefault();
    //Lagra värden
    let kurskod: string = courseCodeInput.value;
    let kursnamn: string = courseNameInput.value;
    let progression: string = progressionInput.value.toUpperCase();
    let kursplan: string = coursePlanInput.value;

    // Hitta index för den kurs som redigeras
    const index: number = courses.findIndex((course) => course.kurskod === kurs.kurskod);

    // Uppdatera kursen med nya värden
    courses[index] = {
        kurskod,
        kursnamn,
        progression,
        kursplan,
    };

    // Uppdatera LocalStorage med de nya kursvärdena
    localStorage.setItem('courses', JSON.stringify(courses));

    // Återställ formuläret och övriga inställningar efter att ändringarna har sparats
    isEditing = false;
    console.log(isEditing);
    submitBtn.value = 'Lägg till kurs';
    submitBtn.addEventListener('click', addCourse); // Lägg tillbaka händelselyssnare för att lägga till kurs
    printCourses(); // Uppdatera listan med kurser
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
