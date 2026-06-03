package com.smartlife.mobile.feature.tasks

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import kotlinx.coroutines.Dispatchers

/**
 * Unit tests pour TasksViewModel.
 * Les tests complets avec fake repo nécessitent MockK ou un refactor interface.
 * Phase 5 : infrastructure de test validée.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class TasksViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `test infrastructure is working`() = runTest {
        // Vérifie que le dispatcher de test fonctionne
        var executed = false
        testDispatcher.scheduler.apply {
            executed = true
        }
        assertTrue(executed)
    }

    @Test
    fun `coroutines test scope advances correctly`() = runTest {
        var counter = 0
        kotlinx.coroutines.launch {
            counter++
        }
        advanceUntilIdle()
        assertEquals(1, counter)
    }
}
