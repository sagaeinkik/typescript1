/* DOM-VARIABLER */
//Formulär
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

//Håller koll på vilken kurs som redigeras, om någon: använd för att styra vilkn funktion vid submit av formulär
let editingCourseIndex: number | null = null;

//Interface för nya kurser
interface CourseInterface {
    kurskod: string;
    kursnamn: string;
    progression: string;
    kursplan: string;
}

//Hämta kurser från localStorage
let courses: CourseInterface[] = JSON.parse(localStorage.getItem('courses') || '[]');

/* HÄNDELSEHANTERARE */
//Skriv ut kurser när sidan laddats
window.addEventListener('load', printCourses);

//Vid submit
courseForm.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    // Om ingen kurs redigeras, lägg till en ny kurs
    if (editingCourseIndex === null) {
        addCourse();
        // Annars uppdatera kursen
    } else {
        updateCourse();
    }
});

// Funktion för att returnera om kurskoden är unik
function uniqueCode(code: string): boolean {
    //Loopa igenom kurserna och se om det finns mer än 1 med samma kod
    return courses.every((course) => course.kurskod !== code);
}

//Funktion för att validera input!
function validateInput(
    kurskod: string,
    kursnamn: string,
    progression: string,
    kursplan: string
): boolean {
    // Kolla längd på kurskod
    if (kurskod.length < 1) {
        error1.textContent = 'Du måste ange en kurskod';
        error2.textContent = '';
        error3.textContent = '';
        error4.textContent = '';
        return false;
    }
    //Kolla unikhet på kurskod om vi lägger till en ny kurs (inte annars)
    if (editingCourseIndex === null) {
        if (!uniqueCode(kurskod)) {
            error1.innerHTML = 'Kurskoden måste vara unik';
            error2.innerHTML = '';
            error3.innerHTML = '';
            error4.innerHTML = '';
            return false;
        }
    }
    // Kolla kursnamn
    if (kursnamn.length < 1) {
        error1.textContent = '';
        error2.textContent = 'Du måste ange ett kursnamn';
        error3.textContent = '';
        error4.textContent = '';
        return false;
    }
    // Kolla progression
    if (!['A', 'B', 'C'].includes(progression)) {
        error1.textContent = '';
        error2.textContent = '';
        error3.textContent = 'Kursens progression måste vara A, B eller C';
        error4.textContent = '';
        return false;
    }
    // Kolla att kursplan är url
    if (kursplan.length < 1 || !kursplan.includes('http') || !kursplan.includes('.')) {
        error1.textContent = '';
        error2.textContent = '';
        error3.textContent = '';
        error4.textContent =
            'Du måste ange en giltig länk till kursplanen med protokoll (http/https) och TLD (.se, .com osv)';
        return false;
    }

    // Nollställ fel
    error1.textContent = '';
    error2.textContent = '';
    error3.textContent = '';
    error4.textContent = '';

    //Om vi har kommit såhär långt är allt grett!
    return true;
}

/* Funktion för att lägga till kurs */
function addCourse(): void {
    //Variabler för värdena i fälten
    const kurskod: string = courseCodeInput.value;
    const kursnamn: string = courseNameInput.value;
    const progression: string = progressionInput.value.toUpperCase();
    const kursplan: string = coursePlanInput.value;

    // Om validering inte returnerar true, abort mission
    if (!validateInput(kurskod, kursnamn, progression, kursplan)) {
        return;
    }

    // Annars lägg till nya kursen enligt interface
    const newCourse: CourseInterface = {
        kurskod,
        kursnamn,
        progression,
        kursplan,
    };
    //Peta in i arrayen och uppdatera storage
    courses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(courses));

    // Återställ formuläret
    resetFields();
    // Uppdatera kurslistan
    printCourses();
}

/* Funktion för att skriva ut kurserna till DOM */
function printCourses(): void {
    const courseList = <HTMLDivElement>document.querySelector('div.courselist');
    courseList.innerHTML = ''; // Rensa listan

    if (courses.length === 0) {
        courseList.innerHTML = '<p>Det finns inga kurser att visa ännu...</p>';
    } else {
        // Loopa igenom och skriv ut varje kurs
        courses.forEach((kurs, index) => {
            const courseDiv = <HTMLDivElement>document.createElement('div');
            courseDiv.classList.add('course');

            //Kurskod
            const codeP = <HTMLParagraphElement>document.createElement('p');
            codeP.textContent = kurs.kurskod;
            courseDiv.appendChild(codeP);

            //Kursnamn
            const nameP = <HTMLParagraphElement>document.createElement('p');
            nameP.textContent = kurs.kursnamn;
            courseDiv.appendChild(nameP);

            //Progression
            const progP = <HTMLParagraphElement>document.createElement('p');
            progP.textContent = kurs.progression;
            courseDiv.appendChild(progP);

            //Länk till kursplan
            const linkA = <HTMLAnchorElement>document.createElement('a');
            linkA.href = kurs.kursplan;
            linkA.setAttribute('target', '_blank');
            linkA.textContent = 'Länk till kursplan';
            courseDiv.appendChild(linkA);

            //Div för knappar
            const controlsDiv = <HTMLDivElement>document.createElement('div');
            controlsDiv.classList.add('controls');

            //Ändra-knappen:
            const editBtn = <HTMLButtonElement>document.createElement('button');
            editBtn.classList.add('change');
            editBtn.textContent = 'Ändra kurs';
            //Lägg på händelsehanterare
            editBtn.addEventListener('click', (e: Event) => {
                //Tilldela redigeringsindex till variabeln
                editingCourseIndex = index;

                //kalla på funktion som fyller i fälten
                loadValuesForEdit(kurs);
                // Ändra text på knappen
                submitBtn.value = 'Spara ändringar';
            });

            //Radera-knappen
            const deleteBtn = <HTMLButtonElement>document.createElement('button');
            deleteBtn.classList.add('delete');
            deleteBtn.textContent = 'Ta bort';
            //Lägg till händelsehanterare
            deleteBtn.addEventListener('click', () => {
                /* När man använde index i foreach-loopen så blev det skumt när man skulle ta bort kurser i slumpmässig ordning,
                så lagra kurskod i variabel och använd för att filtrera bort istället */
                const courseCodeToRemove: string = kurs.kurskod;
                courses = courses.filter(
                    (course: CourseInterface) => course.kurskod !== courseCodeToRemove
                );
                // Uppdatera storage och ta bort diven från DOM
                localStorage.setItem('courses', JSON.stringify(courses));
                courseDiv.remove();

                if (courses.length < 1) {
                    courseList.innerHTML = '<p>Det finns inga kurser att visa ännu...</p>';
                }
            });

            //Peta in knappar i div.controls, peta in div.controls i DOM
            controlsDiv.appendChild(editBtn);
            controlsDiv.appendChild(deleteBtn);
            courseDiv.appendChild(controlsDiv);

            //Span element som avdelare
            const span = <HTMLSpanElement>document.createElement('span');
            span.classList.add('divider');
            courseDiv.appendChild(span);

            courseList.appendChild(courseDiv);
        });
    }
}

/* Funktion för att fylla i värden */
function loadValuesForEdit(kurs: CourseInterface): void {
    courseCodeInput.value = kurs.kurskod;
    courseNameInput.value = kurs.kursnamn;
    progressionInput.value = kurs.progression;
    coursePlanInput.value = kurs.kursplan;
}

/* Funktion för att uppdatera kurs */
function updateCourse(): void {
    // Om det inte finns en kurs att redigera, avbryt på en gång
    if (editingCourseIndex === null) return;

    //Lagra värdena från input
    const kurskod: string = courseCodeInput.value;
    const kursnamn: string = courseNameInput.value;
    const progression: string = progressionInput.value.toUpperCase();
    const kursplan: string = coursePlanInput.value;

    // Validera inmatning
    if (!validateInput(kurskod, kursnamn, progression, kursplan)) {
        return;
    }

    // Uppdatera kursen med rätt index
    courses[editingCourseIndex] = {
        kurskod,
        kursnamn,
        progression,
        kursplan,
    };
    localStorage.setItem('courses', JSON.stringify(courses));

    // Nollställ fält
    resetFields();
    //Uppdatera kurslistan
    printCourses();

    // Återställ redigeringsindex
    editingCourseIndex = null;
    //Ändra knapp
    submitBtn.value = 'Lägg till kurs';
}

// Återställ fälten i formuläret
function resetFields(): void {
    //Töm input
    courseCodeInput.value = '';
    courseNameInput.value = '';
    progressionInput.value = '';
    coursePlanInput.value = '';

    //Töm error
    error1.textContent = '';
    error2.textContent = '';
    error3.textContent = '';
    error4.textContent = '';

    //Flytta caret till första input
    courseCodeInput.focus();
}
