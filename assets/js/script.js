document.getElementById("convertir").addEventListener("click", async () => {
  const monto = document.getElementById("monto").value;
  const monedaSeleccionada = document.getElementById("moneda").value;

  if (monto === "" || monto <= 0) {
    document.getElementById("resultado").innerText = "Ingrese un monto válido.";
    return;
  }

  const datos = await obtenerTiposDeCambio();

  if (datos) {
    const tasaCambio = datos[monedaSeleccionada].valor;
    const resultado = (monto / tasaCambio).toFixed(2);
    document.getElementById(
      "resultado"
    ).innerText = `Resultado: ${resultado} ${monedaSeleccionada.toUpperCase()}`;
    obtenerHistorial(monedaSeleccionada);
  }
});

async function obtenerTiposDeCambio() {
  try {
    const respuesta = await fetch("https://mindicador.cl/api/");
    if (!respuesta.ok) throw new Error("API no disponible");
    const datos = await respuesta.json();
    return datos;
  } catch (error) {
    console.error("Error obteniendo datos de la API", error);
    document.getElementById("resultado").innerText =
      "Error al obtener los datos.";
    return null;
  }
}

async function obtenerHistorial(moneda) {
  try {
    const respuesta = await fetch(`https://mindicador.cl/api/${moneda}`);
    const datos = await respuesta.json();

    const ultimos10Dias = datos.serie.slice(0, 10).reverse(); // Tomamos solo los últimos 10 días

    const fechas = ultimos10Dias.map((d) =>
      new Date(d.fecha).toLocaleDateString()
    );
    const valores = ultimos10Dias.map((d) => d.valor);

    graficarHistorial(fechas, valores);
  } catch (error) {
    console.error("Error obteniendo historial", error);
  }
}

function graficarHistorial(fechas, valores) {
  const ctx = document.getElementById("grafico").getContext("2d");

  if (window.miGrafico) {
    window.miGrafico.destroy(); // Destruye el gráfico anterior si existe
  }

  window.miGrafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: fechas,
      datasets: [
        {
          label: "Valor histórico",
          data: valores,
          borderColor: "blue",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}
