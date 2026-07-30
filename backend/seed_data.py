DEFAULT_SERVICES = [
    {
        "id": "impresion-3d-prototipos",
        "title": "Impresion 3D para prototipos",
        "description": "Validacion rapida de piezas, carcasas, soportes y modelos funcionales.",
        "base_price": 15000,
        "category": "3d",
        "image": "https://images.unsplash.com/photo-1627637819794-fba32f82be16?auto=format&fit=crop&w=1200&q=85",
        "features": ["PLA, PETG y TPU", "Revision previa del archivo", "Entrega estimada 48-72h"],
    },
    {
        "id": "piezas-funcionales",
        "title": "Piezas funcionales",
        "description": "Repuestos, soportes y componentes pensados para uso real.",
        "base_price": 25000,
        "category": "3d",
        "image": "https://images.unsplash.com/photo-1627637819794-fba32f82be16?auto=format&fit=crop&w=1200&q=85",
        "features": ["Orientacion tecnica", "Material segun uso", "Acabado a pedido"],
    },
    {
        "id": "figuras-modelos",
        "title": "Figuras y modelos",
        "description": "Objetos decorativos, coleccionables, merchandising y regalos personalizados.",
        "base_price": 20000,
        "category": "3d",
        "image": "https://images.unsplash.com/photo-1627637819794-fba32f82be16?auto=format&fit=crop&w=1200&q=85",
        "features": ["Colores personalizados", "Pintado opcional", "Series pequenas"],
    },
    {
        "id": "modelado-3d",
        "title": "Diseno y modelado 3D",
        "description": "Apoyo para transformar una idea, pieza o foto en un archivo imprimible.",
        "base_price": 30000,
        "category": "3d",
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85",
        "features": ["Modelado desde referencia", "Ajuste de dimensiones", "Archivo listo para imprimir"],
    },
    {
        "id": "banners-rollups",
        "title": "Roll-ups y banners",
        "description": "Piezas graficas para eventos, locales y acciones comerciales.",
        "base_price": 35000,
        "category": "grafica",
        "image": "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=1200&q=85",
        "features": ["Formato listo para imprimir", "Asesoria de medidas", "Produccion por encargo"],
    },
    {
        "id": "material-publicitario",
        "title": "Material publicitario",
        "description": "Volantes, tarjetas y piezas impresas para comunicar tu marca.",
        "base_price": 12000,
        "category": "grafica",
        "image": "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=1200&q=85",
        "features": ["Diseno base", "Tirajes flexibles", "Entrega coordinada"],
    },
]

DEFAULT_PORTFOLIO = [
    {
        "id": "prototipo-industrial",
        "title": "Prototipo funcional",
        "category": "Impresion 3D",
        "image": "https://images.unsplash.com/photo-1612886653463-311e7497e688?auto=format&fit=crop&w=1200&q=85",
        "description": "Placeholder hasta subir fotos originales autorizadas.",
    },
    {
        "id": "repuesto-personalizado",
        "title": "Repuesto personalizado",
        "category": "Pieza funcional",
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85",
        "description": "Placeholder hasta subir fotos originales autorizadas.",
    },
    {
        "id": "figura-coleccionable",
        "title": "Figura coleccionable",
        "category": "Producto personalizado",
        "image": "https://images.unsplash.com/photo-1627637819794-fba32f82be16?auto=format&fit=crop&w=1200&q=85",
        "description": "Placeholder hasta subir fotos originales autorizadas.",
    },
    {
        "id": "material-evento",
        "title": "Material para evento",
        "category": "Grafica publicitaria",
        "image": "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=1200&q=85",
        "description": "Placeholder hasta subir fotos originales autorizadas.",
    },
]

DEFAULT_COURSES = [
    {
        "course": {
            "id": "blender-impresion-3d",
            "title": "Blender para impresion 3D desde cero",
            "slug": "blender-impresion-3d",
            "description": "Aprende a modelar piezas simples, corregir errores y preparar archivos listos para imprimir.",
            "intro": "Un curso practico para pasar de una idea a un STL imprimible, con foco en piezas reales para una impresora 3D.",
            "level": "principiante",
            "price": 29900,
            "image": "https://images.unsplash.com/photo-1612886653463-311e7497e688?auto=format&fit=crop&w=1400&q=85",
            "duration": "4 horas",
            "lesson_count": 4,
            "tags": ["Blender", "modelado", "impresion 3D", "STL"],
        },
        "modules": [
            {
                "title": "Fundamentos de modelado para impresion",
                "description": "Configura Blender y entiende como piensa una impresora 3D.",
                "lessons": [
                    {
                        "title": "Introduccion gratuita: del modelo al objeto",
                        "description": "Vista previa del flujo completo.",
                        "content": "En esta clase veras como se transforma una idea en un archivo imprimible y que errores conviene evitar antes de laminar.",
                        "duration": "12 min",
                        "is_free_preview": True,
                    },
                    {
                        "title": "Unidades, escala y medidas reales",
                        "description": "Configura la escena para trabajar en milimetros.",
                        "content": "Aprenderas a configurar unidades, aplicar escala y medir piezas para que el STL salga con dimensiones correctas.",
                        "duration": "18 min",
                        "is_free_preview": False,
                    },
                ],
            },
            {
                "title": "Piezas listas para imprimir",
                "description": "Modela, revisa y exporta.",
                "lessons": [
                    {
                        "title": "Modelar un soporte simple",
                        "description": "Proyecto guiado de una pieza funcional.",
                        "content": "Construiremos un soporte con medidas reales, espesores minimos y tolerancias faciles de imprimir.",
                        "duration": "35 min",
                        "is_free_preview": False,
                    },
                    {
                        "title": "Exportar STL y revisar malla",
                        "description": "Checklist antes de mandar a imprimir.",
                        "content": "Veras como revisar normales, piezas no manifold y exportar un STL limpio para slicer.",
                        "duration": "22 min",
                        "is_free_preview": False,
                    },
                ],
            },
        ],
    },
    {
        "course": {
            "id": "prototipado-productos-3d",
            "title": "Prototipado rapido de productos 3D",
            "slug": "prototipado-productos-3d",
            "description": "Diseña, prueba y mejora prototipos para productos personalizados o piezas funcionales.",
            "intro": "Aprende un flujo de trabajo ordenado para validar ideas con iteraciones cortas y bajo costo.",
            "level": "intermedio",
            "price": 39900,
            "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1400&q=85",
            "duration": "5 horas",
            "lesson_count": 2,
            "tags": ["prototipado", "producto", "PETG", "diseno para impresion"],
        },
        "modules": [
            {
                "title": "Proceso profesional",
                "description": "De problema a prototipo medible.",
                "lessons": [
                    {
                        "title": "Clase gratuita: validar antes de imprimir",
                        "description": "Como definir el objetivo del prototipo.",
                        "content": "Aprenderas a bajar una idea a requisitos claros: medidas, uso, material y pruebas que debe superar.",
                        "duration": "15 min",
                        "is_free_preview": True,
                    },
                    {
                        "title": "Materiales segun uso",
                        "description": "PLA, PETG, ABS y TPU sin humo.",
                        "content": "Compararemos materiales segun resistencia, temperatura, acabado y costo.",
                        "duration": "28 min",
                        "is_free_preview": False,
                    },
                ],
            }
        ],
    },
    {
        "course": {
            "id": "miniaturas-productos-personalizados",
            "title": "Miniaturas y productos personalizados",
            "slug": "miniaturas-productos-personalizados",
            "description": "Crea objetos decorativos, regalos y miniaturas con criterio de produccion.",
            "intro": "Ideal para quienes quieren vender productos personalizados o mejorar acabados visuales.",
            "level": "principiante",
            "price": 0,
            "image": "https://images.unsplash.com/photo-1627637819794-fba32f82be16?auto=format&fit=crop&w=1400&q=85",
            "duration": "1.5 horas",
            "lesson_count": 2,
            "tags": ["productos personalizados", "acabado", "resina", "PLA"],
        },
        "modules": [
            {
                "title": "Curso gratuito",
                "description": "Primeros pasos para productos vendibles.",
                "lessons": [
                    {
                        "title": "Elegir una idea vendible",
                        "description": "Criterios simples para partir.",
                        "content": "Veras como elegir productos pequenos, repetibles y con buen margen para una primera coleccion.",
                        "duration": "14 min",
                        "is_free_preview": True,
                    },
                    {
                        "title": "Preparar una mini serie",
                        "description": "Ordena colores, tiempos y empaque.",
                        "content": "Aprenderas a preparar una tanda pequena y documentar parametros para repetir calidad.",
                        "duration": "20 min",
                        "is_free_preview": True,
                    },
                ],
            }
        ],
    },
]
