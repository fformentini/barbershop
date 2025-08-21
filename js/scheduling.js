document.addEventListener('DOMContentLoaded', () => {
    const scheduleButtons = document.querySelectorAll('.btn-schedule');
    const overlay = document.getElementById('overlay');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const datePicker = document.getElementById('date-picker');
    const timeContainer = document.getElementById('time-slots-container');
    const confirmBtn = document.getElementById('confirm-btn');

    // Bloqueia a digitação manual no campo de data
    datePicker.addEventListener('keydown', (e) => {
        e.preventDefault();
    });

    // ESTADO DO AGENDAMENTO 
    let currentService = null;
    let selectedTime = null;

    // configuração da barbearia
    const barbershopConfig = {
        diasDeTrabalho: [1, 2, 3, 4, 5, 6], // Segunda a Sábado (0=Domingo, 1=Segunda, ...)
        horarioAbertura: 9,
        horarioFechamento: 20,
        intervaloMinutos: 30, // Intervalo entre os horários
    };

    // FUNÇÕES 

    function gerarHorariosDisponiveis(dataString) { // Gera os horários disponíveis para o dia selecionado
        const horarios = { Manhã: [], Tarde: [], Noite: [] };
        const dataSelecionada = new Date(`${dataString}T00:00:00`);
        const diaDaSemana = dataSelecionada.getDay();
        const agora = new Date();
        const isToday = dataSelecionada.toDateString() === agora.toDateString();
        if (!barbershopConfig.diasDeTrabalho.includes(diaDaSemana)) { return {}; }
        for (let hora = barbershopConfig.horarioAbertura; hora < barbershopConfig.horarioFechamento; hora++) {
            for (let minuto = 0; minuto < 60; minuto += barbershopConfig.intervaloMinutos) {
                if (isToday) {
                    if (hora < agora.getHours() || (hora === agora.getHours() && minuto <= agora.getMinutes())) { continue; }
                }
                const seed = dataSelecionada.getDate() + hora + minuto;
                if (seed % 4 === 0 || seed % 7 === 0) { continue; }
                const horaFormatada = String(hora).padStart(2, '0');
                const minutoFormatado = String(minuto).padStart(2, '0');
                const time = `${horaFormatada}:${minutoFormatado}`;
                if (hora < 12) { horarios.Manhã.push(time); } else if (hora < 18) { horarios.Tarde.push(time); } else { horarios.Noite.push(time); }
            }
        }
        return horarios;
    }

    function renderTimes(date) {  // Renderiza os horários disponíveis para o dia selecionado
        timeContainer.innerHTML = ''; selectedTime = null; confirmBtn.disabled = true; const daySlots = gerarHorariosDisponiveis(date);
        if (Object.keys(daySlots).length === 0) { timeContainer.innerHTML = 'Barbearia fechada neste dia. Por favor, selecione outro dia.'; return; }
        Object.keys(daySlots).forEach(period => {
            const periodSlots = daySlots[period]; if (periodSlots.length > 0) {
                timeContainer.innerHTML += `<h4>${period}</h4>`; const grid = document.createElement('div'); grid.className = 'time-grid'; periodSlots.forEach(time => { grid.innerHTML += `<button class="time-button">${time}</button>`; }); timeContainer.appendChild(grid);
            }
        });
        if (timeContainer.innerHTML === '') {
            const dataSelecionada = new Date(`${date}T00:00:00`); const isToday = dataSelecionada.toDateString() === new Date().toDateString();
            if (isToday) { timeContainer.innerHTML = 'Não há mais horários disponíveis para hoje.'; } else { timeContainer.innerHTML = 'Todos os horários para este dia foram preenchidos.'; }
        }
    }
    function setMinDate() {  // Define a data mínima do datePicker como hoje
        const today = new Date(); const year = today.getFullYear(); const month = String(today.getMonth() + 1).padStart(2, '0'); const day = String(today.getDate()).padStart(2, '0'); datePicker.min = `${year}-${month}-${day}`;
    }

    function formatDate(dateString) {  // Formata a data no formato DD/MM/YYYY
        const [year, month, day] = dateString.split('-'); return `${day}/${month}/${year}`;
    }

    function resetModal() { // Reseta o modal para o estado inicial
        datePicker.value = ''; timeContainer.innerHTML = 'Selecione uma data para ver os horários.'; confirmBtn.disabled = true; selectedTime = null;
    }

    // --- EVENT LISTENERS ---
    scheduleButtons.forEach(button => { // Adiciona o evento de clique a cada botão de agendamento
        button.addEventListener('click', () => { currentService = button.dataset.service; modalTitle.textContent = `Agendar: ${currentService}`; resetModal(); overlay.style.display = 'flex'; });
    });
    closeModalBtn.addEventListener('click', () => { overlay.style.display = 'none'; });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.style.display = 'none'; } });

    datePicker.addEventListener('change', (e) => {
        const selectedDateString = e.target.value;
        if (!selectedDateString) {
            timeContainer.innerHTML = 'Selecione uma data para ver os horários.';
            confirmBtn.disabled = true;
            return;
        }
        const selectedDate = new Date(`${selectedDateString}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            //Substituído o alert() por Swal.fire()
            Swal.fire({
                icon: 'error',
                title: 'Data Inválida',
                text: 'Não é possível agendar em uma data que já passou. Por favor, escolha uma data a partir de hoje.'
            });
            e.target.value = "";
            timeContainer.innerHTML = 'Data inválida. Por favor, selecione novamente.';
            confirmBtn.disabled = true;
            return;
        }

        const currentYear = today.getFullYear();
        const selectedYear = selectedDate.getFullYear();
        if (selectedYear > currentYear) {
            // Substituído o alert() por Swal.fire()
            Swal.fire({
                icon: 'error',
                title: 'Data Inválida',
                text: 'Agendamentos estão disponíveis apenas para o ano corrente. Por favor, selecione uma data deste ano.'
            });
            e.target.value = "";
            timeContainer.innerHTML = 'Data inválida. Por favor, selecione novamente.';
            confirmBtn.disabled = true;
            return;
        }

        renderTimes(selectedDateString);
    });

    timeContainer.addEventListener('click', (e) => {  // Adiciona o evento de clique aos botões de horário
        if (e.target.classList.contains('time-button')) { timeContainer.querySelectorAll('.time-button').forEach(btn => btn.classList.remove('selected')); e.target.classList.add('selected'); selectedTime = e.target.textContent; confirmBtn.disabled = false; }
    });

    confirmBtn.addEventListener('click', () => { // Evento de confirmação do agendamento
        const selectedDate = datePicker.value;
        if (currentService && selectedDate && selectedTime) {
            // Substituído o alert() por Swal.fire()
            Swal.fire({
                icon: 'success',
                title: 'Agendamento Confirmado!',
                // 'html' para poder formatar o texto com quebras de linha
                html: `
                    Serviço: <strong>${currentService}</strong><br>
                    Data: <strong>${formatDate(selectedDate)}</strong><br>
                    Horário: <strong>${selectedTime}</strong>
                `,
                confirmButtonText: 'Ótimo!',
                confirmButtonColor: 'goldenrod'
            }).then((result) => {
                // Fecha o modal somente depois que o usuário clica em "Ótimo!"
                if (result.isConfirmed) {
                    overlay.style.display = 'none';
                }
            });
        }
    });

    // inicialização
    setMinDate();
    overlay.style.display = 'none';
});