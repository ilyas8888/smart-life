package com.smartlife.service;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PortionResolverServiceTest {

    private final OpenFoodFactsService openFoodFactsService = mock(OpenFoodFactsService.class);
    private final PortionResolverService service = new PortionResolverService(openFoodFactsService);

    @Test
    void resolveEggWhole_pieceConfidenceHigh() {
        Map<String, Object> result = service.resolve(Map.of(
            "portions", Map.of(
                "piece", portion(50, "curated", 0.95)
            )
        ), "Egg, whole, raw");

        Map<?, ?> piece = (Map<?, ?>) result.get("piece");
        assertThat(((Number) piece.get("confidence")).doubleValue()).isGreaterThanOrEqualTo(0.9);
        assertThat(((Number) piece.get("grams")).doubleValue()).isBetween(40.0, 70.0);
    }

    @Test
    void resolveGrape_absurdPieceDowngraded() {
        Map<String, Object> result = service.resolve(Map.of(
            "portions", Map.of(
                "piece", portion(100, "default", 0.2)
            )
        ), "Grapes, raw");

        Map<?, ?> piece = (Map<?, ?>) result.get("piece");
        assertThat(((Number) piece.get("confidence")).doubleValue()).isLessThanOrEqualTo(0.15);
    }

    @Test
    void resolveUnknownFood_offEnrichment() {
        when(openFoodFactsService.searchServing("Raisins, golden, seedless"))
            .thenReturn(Optional.of(Map.of(
                "grams", 40.0,
                "label", "1 serving 40g",
                "source", "openfoodfacts",
                "confidence", 0.75
            )));

        Map<String, Object> result = service.resolve(Map.of(
            "portions", Map.of(
                "serving", portion(100, "default", 0.2)
            )
        ), "Raisins, golden, seedless");

        verify(openFoodFactsService).searchServing("Raisins, golden, seedless");
        Map<?, ?> serving = (Map<?, ?>) result.get("serving");
        assertThat(((Number) serving.get("grams")).doubleValue()).isEqualTo(40.0);
    }

    @Test
    void resolveBread_sliceReasonable() {
        Map<String, Object> result = service.resolve(Map.of(
            "portions", Map.of(
                "piece", portion(28, "curated", 0.95)
            )
        ), "Bread, white");

        Map<?, ?> piece = (Map<?, ?>) result.get("piece");
        assertThat(((Number) piece.get("confidence")).doubleValue()).isEqualTo(0.95);
    }

    @Test
    void resolveOliveOil_tbspReasonable() {
        Map<String, Object> result = service.resolve(Map.of(
            "portions", Map.of(
                "tbsp", portion(14, "curated", 0.95)
            )
        ), "Olive oil");

        Map<?, ?> tbsp = (Map<?, ?>) result.get("tbsp");
        assertThat(((Number) tbsp.get("confidence")).doubleValue()).isEqualTo(0.95);
    }

    private Map<String, Object> portion(double grams, String source, double confidence) {
        return Map.of(
            "grams", grams,
            "label", "1 portion",
            "source", source,
            "confidence", confidence
        );
    }
}
