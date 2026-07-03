
                // Load time from localStorage
                let timeTakenSeconds = localStorage.getItem('examPad_timeTaken')
                    ? parseInt(localStorage.getItem('examPad_timeTaken'))
                    : 0;

                setInterval(() => {
                    timeTakenSeconds++;
                    localStorage.setItem('examPad_timeTaken', timeTakenSeconds);

                    const hrs = String(Math.floor(timeTakenSeconds / 3600)).padStart(2, '0');
                    const mins = String(Math.floor((timeTakenSeconds % 3600) / 60)).padStart(2, '0');
                    const secs = String(timeTakenSeconds % 60).padStart(2, '0');
                    const el = document.getElementById('realtimeClock');
                    if (el) el.textContent = `${hrs}:${mins}:${secs}`;
                }, 1000);
            
